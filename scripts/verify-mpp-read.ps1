param(
  [string]$ProjectPath = "data/Oil Jetty Project - change in work method_V4 sections.mpp",
  [string]$OutputPath = "data/mpp-read-sample.json",
  [int]$TaskSampleSize = 3,
  [int]$DependencySampleSize = 5
)

$resolvedProjectPath = Resolve-Path $ProjectPath -ErrorAction Stop
$outputFullPath = Join-Path (Get-Location) $OutputPath

$projectApp = $null
$projectFile = $null

function Parse-DependencyToken {
  param([string]$DependencyText)

  $trimmed = $DependencyText.Trim()
  $match = [regex]::Match($trimmed, '^(?<id>\d+)(?<type>FS|SS|FF|SF)?(?<lagSign>[+-])?(?<lagValue>\d+)?\s*(?<lagFormat>.*)?$')

  if (-not $match.Success) {
    return [pscustomobject]@{
      predecessorId = $trimmed
      type = ""
      lag = ""
      lagFormat = ""
    }
  }

  $lag = ""
  if ($match.Groups["lagValue"].Success) {
    $lagPrefix = if ($match.Groups["lagSign"].Success) { $match.Groups["lagSign"].Value } else { "" }
    $lag = "$lagPrefix$($match.Groups["lagValue"].Value)"
  }

  return [pscustomobject]@{
    predecessorId = $match.Groups["id"].Value
    type = $match.Groups["type"].Value
    lag = $lag
    lagFormat = $match.Groups["lagFormat"].Value.Trim()
  }
}

function Get-ReadablePropertyCatalog {
  param(
    [Parameter(Mandatory = $true)]
    $Object
  )

  $catalog = @()
  $properties = $Object | Get-Member -MemberType Property | Select-Object -ExpandProperty Name

  foreach ($propertyName in $properties) {
    try {
      $value = $Object.$propertyName
      $valueType = if ($null -eq $value) { "null" } else { $value.GetType().Name }

      $catalog += [pscustomobject]@{
        name = $propertyName
        readable = $true
        valueType = $valueType
      }
    }
    catch {
      $catalog += [pscustomobject]@{
        name = $propertyName
        readable = $false
        valueType = "unavailable"
      }
    }
  }

  return @($catalog | Sort-Object name)
}

try {
  $projectApp = New-Object -ComObject MSProject.Application
  $projectApp.Visible = $false
  $projectApp.DisplayAlerts = 0
  $projectApp.FileOpen($resolvedProjectPath.Path)
  $projectFile = $projectApp.ActiveProject

  $tasks = @()
  foreach ($task in $projectFile.Tasks) {
    if ($null -eq $task) {
      continue
    }

    $tasks += [pscustomobject]@{
      id = [string]$task.ID
      uniqueId = [string]$task.UniqueID
      wbs = [string]$task.WBS
      name = [string]$task.Name
      summary = [bool]$task.Summary
      startDate = if ($task.Start) { ([datetime]$task.Start).ToString("yyyy-MM-ddTHH:mm:ss") } else { "" }
      endDate = if ($task.Finish) { ([datetime]$task.Finish).ToString("yyyy-MM-ddTHH:mm:ss") } else { "" }
    }
  }

  $dependencies = @()
  foreach ($task in $projectFile.Tasks) {
    if ($null -eq $task -or [string]::IsNullOrWhiteSpace([string]$task.Predecessors)) {
      continue
    }

    foreach ($rawPredecessor in ([string]$task.Predecessors).Split(",")) {
      $dependencyText = $rawPredecessor.Trim()
      if ([string]::IsNullOrWhiteSpace($dependencyText)) {
        continue
      }

      $parsedDependency = Parse-DependencyToken -DependencyText $dependencyText

      $dependencies += [pscustomobject]@{
        predecessorId = $parsedDependency.predecessorId
        successorId = [string]$task.ID
        type = $parsedDependency.type
        lag = $parsedDependency.lag
        lagFormat = $parsedDependency.lagFormat
      }
    }
  }

  $selectedTask = $tasks | Select-Object -First 1
  $firstProjectTask = $projectFile.Tasks | Where-Object { $null -ne $_ } | Select-Object -First 1
  $taskPropertyCatalog = if ($firstProjectTask) { Get-ReadablePropertyCatalog -Object $firstProjectTask } else { @() }

  $result = [pscustomobject]@{
    fieldCatalog = [pscustomobject]@{
      selectionFields = @("taskId", "taskUniqueId", "source")
      taskFields = @("id", "uniqueId", "wbs", "name", "summary", "startDate", "endDate")
      dependencyFields = @("predecessorId", "successorId", "type", "lag", "lagFormat")
      taskPropertyCatalog = $taskPropertyCatalog
    }
    sourceFile = $resolvedProjectPath.Path
    taskCount = $tasks.Count
    dependencyCount = $dependencies.Count
    firstTask = $selectedTask
    taskSample = @($tasks | Select-Object -First $TaskSampleSize)
    dependencySample = @($dependencies | Select-Object -First $DependencySampleSize)
  }

  $result | ConvertTo-Json -Depth 6 | Set-Content -Path $outputFullPath -Encoding UTF8
  Write-Output ($result | ConvertTo-Json -Depth 6)
}
finally {
  if ($projectApp) {
    try {
      $projectApp.FileCloseAll(0)
    }
    catch {
    }

    try {
      $projectApp.Quit()
    }
    catch {
    }
  }
}
