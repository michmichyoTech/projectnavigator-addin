param(
  [string]$ProjectPath = "data/Oil Jetty Project - change in work method_V4 sections.mpp",
  [string]$SelectionPath = "data/mpp-selected-task-fields.json",
  [string]$OutputPath = "data/mpp-mapped-first-15.json",
  [int]$TaskCount = 15
)

$resolvedProjectPath = Resolve-Path $ProjectPath -ErrorAction Stop
$resolvedSelectionPath = Resolve-Path $SelectionPath -ErrorAction Stop
$outputFullPath = Join-Path (Get-Location) $OutputPath

$selection = Get-Content -Raw $resolvedSelectionPath.Path | ConvertFrom-Json
$selectedPropertyFields = @($selection.taskPropertyFields)

$projectApp = $null

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

    $mappedFields = [ordered]@{}
    foreach ($fieldName in $selectedPropertyFields) {
      try {
        $value = $task.$fieldName
        if ($value -is [datetime]) {
          $mappedFields[$fieldName] = $value.ToString("yyyy-MM-ddTHH:mm:ss")
        }
        elseif ($null -eq $value) {
          $mappedFields[$fieldName] = ""
        }
        else {
          $mappedFields[$fieldName] = $value
        }
      }
      catch {
        $mappedFields[$fieldName] = ""
      }
    }

    $tasks += [pscustomobject]@{
      id = [string]$task.ID
      uniqueId = [string]$task.UniqueID
      wbs = [string]$task.WBS
      name = [string]$task.Name
      summary = [bool]$task.Summary
      duration = [string]$task.Duration
      predecessors = [string]$task.Predecessors
      successors = [string]$task.Successors
      startDate = if ($task.Start) { ([datetime]$task.Start).ToString("yyyy-MM-ddTHH:mm:ss") } else { "" }
      endDate = if ($task.Finish) { ([datetime]$task.Finish).ToString("yyyy-MM-ddTHH:mm:ss") } else { "" }
      mappedFields = [pscustomobject]$mappedFields
    }
  }

  $result = [pscustomobject]@{
    sourceFile = $resolvedProjectPath.Path
    selectedCoreFields = @($selection.coreFields)
    selectedTaskPropertyFields = @($selectedPropertyFields)
    taskCount = $tasks.Count
    taskSample = @($tasks | Select-Object -First $TaskCount)
  }

  $result | ConvertTo-Json -Depth 8 | Set-Content -Path $outputFullPath -Encoding UTF8
  Write-Output ($result | ConvertTo-Json -Depth 5)
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
