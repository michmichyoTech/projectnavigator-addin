function clearPanelContent(element) {
  if (!element) {
    return;
  }

  element.replaceChildren();
}

function setTaskDetailsLayout(taskDetailsElement, layoutVariant) {
  if (!taskDetailsElement) {
    return;
  }

  taskDetailsElement.classList.remove(
    "task-details-centered",
    "task-details-table-view",
    "task-details-mindmap-view"
  );
  taskDetailsElement.classList.add(layoutVariant);
}

function formatDateForDisplay(value) {
  if (!value) {
    return "";
  }

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return String(value);
  }

  const [, year, month, day] = match;
  return `${day}/${month}/${year.slice(-2)}`;
}

function formatFieldValueForDisplay(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "string") {
    return formatDateForDisplay(value);
  }

  return String(value);
}

function createSelectedTaskCell(label, value) {
  const cell = document.createElement("td");
  const fieldLabel = document.createElement("span");
  const fieldValue = document.createElement("span");

  cell.className = "selected-task-cell";
  fieldLabel.className = "selected-task-field-label";
  fieldValue.className = "selected-task-field-value";
  fieldLabel.textContent = label;
  fieldValue.textContent = value;
  cell.append(fieldLabel, fieldValue);
  return cell;
}

function createTaskCard(task, extraClassName = "", extraFields = []) {
  const taskCard = document.createElement("div");
  const taskTable = document.createElement("table");
  const tableBody = document.createElement("tbody");
  const nameRow = document.createElement("tr");
  const idRow = document.createElement("tr");
  const datesRow = document.createElement("tr");
  const nameCell = document.createElement("td");

  taskCard.className = extraClassName ? `selected-task-card ${extraClassName}` : "selected-task-card";
  taskTable.className = "selected-task-table";
  nameCell.className = "selected-task-name-cell";
  nameCell.colSpan = 2;
  nameCell.textContent = task.name || "";
  nameRow.append(nameCell);
  idRow.append(
    createSelectedTaskCell("ID", task.id || ""),
    createSelectedTaskCell("UID", task.uniqueId || "")
  );
  datesRow.append(
    createSelectedTaskCell("Start date", formatDateForDisplay(task.startDate)),
    createSelectedTaskCell("Finish date", formatDateForDisplay(task.endDate))
  );
  tableBody.append(nameRow, idRow, datesRow);

  extraFields
    .filter((field) => field && field.label)
    .forEach((field, index, fields) => {
      if (index % 2 === 0) {
        const row = document.createElement("tr");
        row.append(
          createSelectedTaskCell(field.label, formatFieldValueForDisplay(field.value)),
          createSelectedTaskCell(
            fields[index + 1]?.label ?? "",
            formatFieldValueForDisplay(fields[index + 1]?.value ?? "")
          )
        );
        tableBody.append(row);
      }
    });

  taskTable.append(tableBody);
  taskCard.append(taskTable);
  return taskCard;
}

function createDependencyItem(task) {
  return createTaskCard(task, "dependency-item");
}

function createDependencyHeading(label, count) {
  const heading = document.createElement("p");
  heading.className = "dependency-heading";
  heading.textContent = `${label} (${count})`;
  return heading;
}

function applyMindmapScale(viewport, canvas, zoomRange, scale) {
  const normalizedScale = Math.max(0.35, Math.min(1.8, scale));

  if (canvas) {
    canvas.style.transform = `scale(${normalizedScale})`;
  }

  if (zoomRange) {
    zoomRange.value = String(normalizedScale);
  }

  if (viewport) {
    viewport.dataset.zoomScale = String(normalizedScale);
  }
}

function isMindmapInteractiveTarget(target) {
  return Boolean(
    target instanceof Element &&
      target.closest(".dependency-card-button, .mindmap-zoom-button, .mindmap-fit-button, .mindmap-zoom-range")
  );
}

function initializeMindmapPan(viewport) {
  if (!viewport || viewport.dataset.panReady === "true") {
    return;
  }

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;
  let startScrollTop = 0;

  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || isMindmapInteractiveTarget(event.target)) {
      return;
    }

    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startScrollLeft = viewport.scrollLeft;
    startScrollTop = viewport.scrollTop;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    viewport.scrollLeft = startScrollLeft - (event.clientX - startX);
    viewport.scrollTop = startScrollTop - (event.clientY - startY);
  });

  const stopDragging = (event) => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    viewport.classList.remove("is-dragging");

    if (event && viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  };

  viewport.addEventListener("pointerup", stopDragging);
  viewport.addEventListener("pointercancel", stopDragging);
  viewport.dataset.panReady = "true";
}

function calculateFitScale(viewport, canvas) {
  if (!viewport || !canvas) {
    return 1;
  }

  const viewportWidth = viewport.clientWidth || 1;
  const viewportHeight = viewport.clientHeight || 1;
  const contentWidth = canvas.scrollWidth || canvas.offsetWidth || 1;
  const contentHeight = canvas.scrollHeight || canvas.offsetHeight || 1;
  const widthScale = viewportWidth / contentWidth;
  const heightScale = viewportHeight / contentHeight;

  return Math.max(0.35, Math.min(1.1, widthScale, heightScale));
}

function getBezierPoint(startPoint, controlPointA, controlPointB, endPoint, t) {
  const inverseT = 1 - t;
  const x =
    inverseT ** 3 * startPoint.x +
    3 * inverseT ** 2 * t * controlPointA.x +
    3 * inverseT * t ** 2 * controlPointB.x +
    t ** 3 * endPoint.x;
  const y =
    inverseT ** 3 * startPoint.y +
    3 * inverseT ** 2 * t * controlPointA.y +
    3 * inverseT * t ** 2 * controlPointB.y +
    t ** 3 * endPoint.y;

  return { x, y };
}

function getBezierConnectorGeometry(startX, startY, endX, endY) {
  const controlOffset = Math.max(56, Math.abs(endX - startX) * 0.35);
  const controlStartX = startX + (endX >= startX ? controlOffset : -controlOffset);
  const controlEndX = endX - (endX >= startX ? controlOffset : -controlOffset);

  return {
    pathData: `M ${startX} ${startY} C ${controlStartX} ${startY}, ${controlEndX} ${endY}, ${endX} ${endY}`,
    midpoint: getBezierPoint(
      { x: startX, y: startY },
      { x: controlStartX, y: startY },
      { x: controlEndX, y: endY },
      { x: endX, y: endY },
      0.5
    )
  };
}

function createBezierConnector(startX, startY, endX, endY) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const connectorGeometry = getBezierConnectorGeometry(startX, startY, endX, endY);

  path.setAttribute("d", connectorGeometry.pathData);
  path.setAttribute("class", "mindmap-connector");
  return path;
}

function createConnectorLabel(label, centerX, centerY) {
  if (!label) {
    return null;
  }

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

  group.setAttribute("class", "mindmap-connector-label");
  text.setAttribute("x", String(centerX));
  text.setAttribute("y", String(centerY - 10));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "central");
  text.textContent = label;
  group.append(background, text);

  requestAnimationFrame(() => {
    const textBox = text.getBBox();
    background.setAttribute("x", String(textBox.x - 8));
    background.setAttribute("y", String(textBox.y - 4));
    background.setAttribute("width", String(textBox.width + 16));
    background.setAttribute("height", String(textBox.height + 8));
    background.setAttribute("rx", "10");
    background.setAttribute("ry", "10");
  });

  return group;
}

function drawMindmapConnectors(
  svg,
  canvas,
  centerCard,
  secondPredecessorRelations,
  predecessorRelations,
  successorRelations,
  secondSuccessorRelations
) {
  if (!svg || !canvas || !centerCard) {
    return;
  }

  svg.replaceChildren();
  const centerLeftX = centerCard.offsetLeft;
  const centerRightX = centerCard.offsetLeft + centerCard.offsetWidth;
  const centerY = centerCard.offsetTop + centerCard.offsetHeight / 2;
  const predecessorCardByTaskId = new Map(
    predecessorRelations.map((relation) => [String(relation.taskId), relation.card])
  );
  const successorCardByTaskId = new Map(
    successorRelations.map((relation) => [String(relation.taskId), relation.card])
  );

  secondPredecessorRelations.forEach((relation) => {
    const childCard = predecessorCardByTaskId.get(String(relation.childTaskId));

    if (!childCard) {
      return;
    }

    const card = relation.card;
    const startX = card.offsetLeft + card.offsetWidth;
    const startY = card.offsetTop + card.offsetHeight / 2;
    const endX = childCard.offsetLeft;
    const endY = childCard.offsetTop + childCard.offsetHeight / 2;
    const connectorGeometry = getBezierConnectorGeometry(startX, startY, endX, endY);

    svg.append(createBezierConnector(startX, startY, endX, endY));
    const label = createConnectorLabel(
      relation.relationLabel,
      connectorGeometry.midpoint.x,
      connectorGeometry.midpoint.y
    );
    if (label) {
      svg.append(label);
    }
  });

  predecessorRelations.forEach((relation) => {
    const card = relation.card;
    const startX = card.offsetLeft + card.offsetWidth;
    const startY = card.offsetTop + card.offsetHeight / 2;
    const connectorGeometry = getBezierConnectorGeometry(startX, startY, centerLeftX, centerY);

    svg.append(createBezierConnector(startX, startY, centerLeftX, centerY));
    const label = createConnectorLabel(
      relation.relationLabel,
      connectorGeometry.midpoint.x,
      connectorGeometry.midpoint.y
    );
    if (label) {
      svg.append(label);
    }
  });

  successorRelations.forEach((relation) => {
    const card = relation.card;
    const endX = card.offsetLeft;
    const endY = card.offsetTop + card.offsetHeight / 2;
    const connectorGeometry = getBezierConnectorGeometry(centerRightX, centerY, endX, endY);

    svg.append(createBezierConnector(centerRightX, centerY, endX, endY));
    const label = createConnectorLabel(
      relation.relationLabel,
      connectorGeometry.midpoint.x,
      connectorGeometry.midpoint.y
    );
    if (label) {
      svg.append(label);
    }
  });

  secondSuccessorRelations.forEach((relation) => {
    const parentCard = successorCardByTaskId.get(String(relation.parentTaskId));

    if (!parentCard) {
      return;
    }

    const card = relation.card;
    const startX = parentCard.offsetLeft + parentCard.offsetWidth;
    const startY = parentCard.offsetTop + parentCard.offsetHeight / 2;
    const endX = card.offsetLeft;
    const endY = card.offsetTop + card.offsetHeight / 2;
    const connectorGeometry = getBezierConnectorGeometry(startX, startY, endX, endY);

    svg.append(createBezierConnector(startX, startY, endX, endY));
    const label = createConnectorLabel(
      relation.relationLabel,
      connectorGeometry.midpoint.x,
      connectorGeometry.midpoint.y
    );
    if (label) {
      svg.append(label);
    }
  });
}

function decorateDependencyCard(dependencyCard, task) {
  dependencyCard.dataset.taskId = task.id || "";
  dependencyCard.classList.add("dependency-card-button");
  dependencyCard.setAttribute("role", "button");
  dependencyCard.tabIndex = 0;
  return dependencyCard;
}

function decorateActiveConstraintCard(dependencyCard, task, activeConstraintTaskIds) {
  if (!Array.isArray(activeConstraintTaskIds) || !activeConstraintTaskIds.includes(String(task.id))) {
    return dependencyCard;
  }

  dependencyCard.classList.add("is-active-start-constraint");
  dependencyCard.setAttribute("data-active-start-constraint", "true");
  return dependencyCard;
}

export function renderTaskDetailsMessage(message) {
  const taskDetails = document.getElementById("task-details");
  const messageElement = document.createElement("p");

  if (!taskDetails) {
    return;
  }

  clearPanelContent(taskDetails);
  setTaskDetailsLayout(taskDetails, "task-details-centered");
  messageElement.className = "task-details-message";
  messageElement.textContent = message;
  taskDetails.append(messageElement);
}

export function renderTaskVisualization(
  task,
  secondPredecessors,
  predecessors,
  successors,
  secondSuccessors,
  activeConstraintTaskIds = [],
  constrainedSuccessorTaskIds = [],
  secondLevelActiveConstraintTaskIds = [],
  secondLevelConstrainedSuccessorTaskIds = [],
  selectedExtraFields = []
) {
  const taskDetails = document.getElementById("task-details");
  const controls = document.createElement("div");
  const zoomOutButton = document.createElement("button");
  const zoomRange = document.createElement("input");
  const zoomInButton = document.createElement("button");
  const fitButton = document.createElement("button");
  const viewport = document.createElement("div");
  const visualization = document.createElement("div");
  const connectors = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const secondPredecessorsColumn = document.createElement("div");
  const predecessorsColumn = document.createElement("div");
  const centerColumn = document.createElement("div");
  const successorsColumn = document.createElement("div");
  const secondSuccessorsColumn = document.createElement("div");

  if (!taskDetails || !task) {
    return;
  }

  clearPanelContent(taskDetails);
  setTaskDetailsLayout(taskDetails, "task-details-mindmap-view");

  controls.className = "mindmap-controls";
  zoomOutButton.className = "mindmap-zoom-button";
  zoomOutButton.type = "button";
  zoomOutButton.textContent = "-";
  zoomRange.className = "mindmap-zoom-range";
  zoomRange.type = "range";
  zoomRange.min = "0.35";
  zoomRange.max = "1.8";
  zoomRange.step = "0.05";
  zoomRange.value = "1";
  zoomInButton.className = "mindmap-zoom-button";
  zoomInButton.type = "button";
  zoomInButton.textContent = "+";
  fitButton.className = "mindmap-fit-button";
  fitButton.type = "button";
  fitButton.textContent = "Fit";
  controls.append(zoomOutButton, zoomRange, zoomInButton, fitButton);

  viewport.className = "mindmap-viewport";
  visualization.className = "task-visualization";
  connectors.classList.add("mindmap-connectors");
  secondPredecessorsColumn.className = "second-predecessors-column";
  predecessorsColumn.className = "predecessors-column";
  centerColumn.className = "selected-task-column";
  successorsColumn.className = "successors-column";
  secondSuccessorsColumn.className = "second-successors-column";

  const secondPredecessorRelations = [];
  const predecessorRelations = [];
  const successorRelations = [];
  const secondSuccessorRelations = [];

  if (Array.isArray(secondPredecessors) && secondPredecessors.length > 0) {
    secondPredecessorsColumn.append(
      createDependencyHeading("Second predecessor level", secondPredecessors.length)
    );
    secondPredecessors.forEach((secondPredecessorRelation) => {
      const dependencyCard = decorateActiveConstraintCard(
        decorateDependencyCard(createDependencyItem(secondPredecessorRelation.task), secondPredecessorRelation.task),
        secondPredecessorRelation.task,
        secondLevelActiveConstraintTaskIds
      );
      secondPredecessorRelations.push({
        card: dependencyCard,
        childTaskId: secondPredecessorRelation.childTaskId,
        relationLabel: secondPredecessorRelation.relationLabel
      });
      secondPredecessorsColumn.append(dependencyCard);
    });
  }

  if (Array.isArray(predecessors) && predecessors.length > 0) {
    predecessorsColumn.append(createDependencyHeading("Direct predecessors", predecessors.length));
    predecessors.forEach((predecessorRelation) => {
      const dependencyCard = decorateActiveConstraintCard(
        decorateDependencyCard(createDependencyItem(predecessorRelation.task), predecessorRelation.task),
        predecessorRelation.task,
        activeConstraintTaskIds
      );
      predecessorRelations.push({
        card: dependencyCard,
        taskId: predecessorRelation.task.id,
        relationLabel: predecessorRelation.relationLabel
      });
      predecessorsColumn.append(dependencyCard);
    });
  }

  if (Array.isArray(successors) && successors.length > 0) {
    successorsColumn.append(createDependencyHeading("Direct successors", successors.length));
    successors.forEach((successorRelation) => {
      const dependencyCard = decorateActiveConstraintCard(
        decorateDependencyCard(createDependencyItem(successorRelation.task), successorRelation.task),
        successorRelation.task,
        constrainedSuccessorTaskIds
      );
      successorRelations.push({
        card: dependencyCard,
        taskId: successorRelation.task.id,
        relationLabel: successorRelation.relationLabel
      });
      successorsColumn.append(dependencyCard);
    });
  }

  if (Array.isArray(secondSuccessors) && secondSuccessors.length > 0) {
    secondSuccessorsColumn.append(
      createDependencyHeading("Second successor level", secondSuccessors.length)
    );
    secondSuccessors.forEach((secondSuccessorRelation) => {
      const dependencyCard = decorateActiveConstraintCard(
        decorateDependencyCard(createDependencyItem(secondSuccessorRelation.task), secondSuccessorRelation.task),
        secondSuccessorRelation.task,
        secondLevelConstrainedSuccessorTaskIds
      );
      secondSuccessorRelations.push({
        card: dependencyCard,
        parentTaskId: secondSuccessorRelation.parentTaskId,
        relationLabel: secondSuccessorRelation.relationLabel
      });
      secondSuccessorsColumn.append(dependencyCard);
    });
  }

  const taskCard = createTaskCard(task, "mindmap-center-card", selectedExtraFields);
  centerColumn.append(taskCard);

  if (secondPredecessorRelations.length > 0) {
    visualization.classList.add("has-second-predecessors");
  }

  if (secondSuccessorRelations.length > 0) {
    visualization.classList.add("has-second-successors");
  }

  if (secondPredecessorRelations.length > 0) {
    visualization.append(secondPredecessorsColumn);
  }

  visualization.append(connectors, predecessorsColumn, centerColumn, successorsColumn);

  if (secondSuccessorRelations.length > 0) {
    visualization.append(secondSuccessorsColumn);
  }

  viewport.append(visualization);
  taskDetails.append(controls, viewport);

  const applyScaleAndRedraw = (nextScale) => {
    applyMindmapScale(viewport, visualization, zoomRange, nextScale);
    drawMindmapConnectors(
      connectors,
      visualization,
      taskCard,
      secondPredecessorRelations,
      predecessorRelations,
      successorRelations,
      secondSuccessorRelations
    );
  };

  zoomOutButton.addEventListener("click", () => {
    applyScaleAndRedraw(Number(zoomRange.value) - 0.1);
  });

  zoomInButton.addEventListener("click", () => {
    applyScaleAndRedraw(Number(zoomRange.value) + 0.1);
  });

  zoomRange.addEventListener("input", () => {
    applyScaleAndRedraw(Number(zoomRange.value));
  });

  fitButton.addEventListener("click", () => {
    applyScaleAndRedraw(calculateFitScale(viewport, visualization));
  });

  viewport.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey) {
        return;
      }

      event.preventDefault();
      const delta = event.deltaY < 0 ? 0.08 : -0.08;
      applyScaleAndRedraw(Number(zoomRange.value) + delta);
    },
    { passive: false }
  );

  initializeMindmapPan(viewport);
  applyScaleAndRedraw(calculateFitScale(viewport, visualization));
}
