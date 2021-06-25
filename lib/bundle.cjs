'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const React = require('react');
const clsx = require('clsx');
const isEqual = require('lodash/isEqual');
const reactDom = require('react-dom');
const reactPopper = require('react-popper');

function useCombinedRefs(...refs) {
  return React.useCallback(handle => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(handle);
      } else if (ref !== null) {
        ref.current = handle;
      }
    }
  }, refs);
}

function useClickOutside(onClick) {
  const frameRequestRef = React.useRef();

  function cancelAnimationFrameRequest() {
    if (typeof frameRequestRef.current === 'number') {
      cancelAnimationFrame(frameRequestRef.current);
      frameRequestRef.current = undefined;
    }
  }

  const onClickRef = React.useRef(() => {
    throw new Error('Cannot call an event handler while rendering.');
  });
  React.useEffect(() => {
    onClickRef.current = onClick;
  });
  React.useEffect(() => {
    function onOutsideClick() {
      frameRequestRef.current = undefined;
      onClickRef.current();
    }

    function onWindowCaptureClick() {
      cancelAnimationFrameRequest();
      frameRequestRef.current = requestAnimationFrame(onOutsideClick);
    }

    window.addEventListener('click', onWindowCaptureClick, {
      capture: true
    });
    return () => {
      window.removeEventListener('click', onWindowCaptureClick, {
        capture: true
      });
      cancelAnimationFrameRequest();
    };
  }, []);
  return cancelAnimationFrameRequest;
}

function useGridDimensions() {
  const gridRef = React.useRef(null);
  const [gridWidth, setGridWidth] = React.useState(1);
  const [gridHeight, setGridHeight] = React.useState(1);
  React.useLayoutEffect(() => {
    const {
      ResizeObserver
    } = window;
    if (ResizeObserver == null) return;
    const resizeObserver = new ResizeObserver(entries => {
      const {
        width,
        height
      } = entries[0].contentRect;
      setGridWidth(width);
      setGridHeight(height);
    });
    resizeObserver.observe(gridRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  return [gridRef, gridWidth, gridHeight];
}

function useFocusRef(isCellSelected) {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    var _ref$current;

    if (!isCellSelected) return;
    (_ref$current = ref.current) == null ? void 0 : _ref$current.focus({
      preventScroll: true
    });
  }, [isCellSelected]);
  return ref;
}

function SelectCellFormatter({
  value,
  tabIndex,
  isCellSelected,
  disabled,
  onClick,
  onChange,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy
}) {
  const inputRef = useFocusRef(isCellSelected);

  function handleChange(e) {
    onChange(e.target.checked, e.nativeEvent.shiftKey);
  }

  return /*#__PURE__*/React.createElement("label", {
    className: 'rdg-checkbox-label' + (disabled ? " rdg-checkbox-label-disabled" : "")
  }, /*#__PURE__*/React.createElement("input", {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    tabIndex: tabIndex,
    ref: inputRef,
    type: "checkbox",
    className: "rdg-checkbox-input",
    disabled: disabled,
    checked: value,
    onChange: handleChange,
    onClick: onClick,
    onCopy: e => console.log(e)
  }), /*#__PURE__*/React.createElement("div", {
    className: "rdg-checkbox"
  }));
}

function ValueFormatter(props) {
  const cellValue = props.cell;
  const valueComponent = React.useMemo(() => {
    try {
      if (typeof cellValue === 'object') {
        return /*#__PURE__*/React.createElement(React.Fragment, null, cellValue.value);
      }

      return /*#__PURE__*/React.createElement(React.Fragment, null, cellValue);
    } catch {
      return null;
    }
  }, [cellValue]);
  return valueComponent;
}

function ToggleGroupFormatter({
  groupKey,
  isExpanded,
  isCellSelected,
  toggleGroup
}) {
  const cellRef = useFocusRef(isCellSelected);

  function handleKeyDown({
    key
  }) {
    if (key === 'Enter') {
      toggleGroup();
    }
  }

  const d = isExpanded ? 'M1 1 L 7 7 L 13 1' : 'M1 7 L 7 1 L 13 7';
  return /*#__PURE__*/React.createElement("span", {
    ref: cellRef,
    className: "rdg-group-cell-content",
    tabIndex: -1,
    onKeyDown: handleKeyDown
  }, groupKey, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 14 8",
    width: "14",
    height: "8",
    className: "rdg-caret"
  }, /*#__PURE__*/React.createElement("path", {
    d: d
  })));
}

function stopPropagation(event) {
  event.stopPropagation();
}
function wrapEvent(ourHandler, theirHandler) {
  if (theirHandler === undefined) return ourHandler;
  return function (event) {
    ourHandler(event);
    theirHandler(event);
  };
}

const SELECT_COLUMN_KEY = 'select-row';
const SelectColumn = {
  key: SELECT_COLUMN_KEY,
  name: '',
  width: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,

  headerRenderer(props) {
    return /*#__PURE__*/React.createElement(SelectCellFormatter, {
      "aria-label": "Select All",
      value: props.allRowsSelected,
      onChange: props.onAllRowsSelectionChange
    });
  },

  formatter(props) {
    return /*#__PURE__*/React.createElement(SelectCellFormatter, {
      "aria-label": "Select",
      tabIndex: -1,
      isCellSelected: props.isCellSelected,
      value: props.isRowSelected,
      onClick: stopPropagation,
      onChange: props.onRowSelectionChange
    });
  },

  groupFormatter(props) {
    return /*#__PURE__*/React.createElement(SelectCellFormatter, {
      "aria-label": "Select Group",
      tabIndex: -1,
      isCellSelected: props.isCellSelected,
      value: props.isRowSelected,
      onChange: props.onRowSelectionChange,
      onClick: stopPropagation
    });
  }

};

function useViewportColumns({
  rawColumns,
  columnWidths,
  viewportWidth,
  scrollLeft,
  defaultColumnOptions,
  rawGroupBy
}) {
  var _defaultColumnOptions, _defaultColumnOptions2, _defaultColumnOptions3, _defaultColumnOptions4;

  const minColumnWidth = (_defaultColumnOptions = defaultColumnOptions == null ? void 0 : defaultColumnOptions.minWidth) != null ? _defaultColumnOptions : 54;
  const defaultFormatter = (_defaultColumnOptions2 = defaultColumnOptions == null ? void 0 : defaultColumnOptions.formatter) != null ? _defaultColumnOptions2 : ValueFormatter;
  const defaultSortable = (_defaultColumnOptions3 = defaultColumnOptions == null ? void 0 : defaultColumnOptions.sortable) != null ? _defaultColumnOptions3 : false;
  const defaultResizable = (_defaultColumnOptions4 = defaultColumnOptions == null ? void 0 : defaultColumnOptions.resizable) != null ? _defaultColumnOptions4 : false;
  const {
    columns,
    lastFrozenColumnIndex,
    totalColumnWidth,
    totalFrozenColumnWidth,
    groupBy
  } = React.useMemo(() => {
    let left = 0;
    let totalWidth = 0;
    let allocatedWidths = 0;
    let unassignedColumnsCount = 0;
    let lastFrozenColumnIndex = -1;
    let totalFrozenColumnWidth = 0;
    const columns = rawColumns.map(metricsColumn => {
      let width = getSpecifiedWidth(metricsColumn, columnWidths, viewportWidth);

      if (width === undefined) {
        unassignedColumnsCount++;
      } else {
        width = clampColumnWidth(width, metricsColumn, minColumnWidth);
        allocatedWidths += width;
      }

      const column = { ...metricsColumn,
        width
      };

      if (rawGroupBy != null && rawGroupBy.includes(column.key)) {
        column.frozen = true;
        column.rowGroup = true;
      }

      if (column.frozen && !column.frozenAlignment) {
        lastFrozenColumnIndex++;
      }

      return column;
    });
    columns.sort(({
      key: aKey,
      frozen: frozenA
    }, {
      key: bKey,
      frozen: frozenB
    }) => {
      if (aKey === SELECT_COLUMN_KEY) return -1;
      if (bKey === SELECT_COLUMN_KEY) return 1;

      if (rawGroupBy != null && rawGroupBy.includes(aKey)) {
        if (rawGroupBy.includes(bKey)) {
          return rawGroupBy.indexOf(aKey) - rawGroupBy.indexOf(bKey);
        }

        return -1;
      }

      if (rawGroupBy != null && rawGroupBy.includes(bKey)) return 1;
      return 0;
    });
    const unallocatedWidth = viewportWidth - allocatedWidths;
    const unallocatedColumnWidth = Math.max(Math.floor(unallocatedWidth / unassignedColumnsCount), minColumnWidth);
    const groupBy = [];
    const calculatedColumns = columns.map((column, idx) => {
      var _column$width, _column$sortable, _column$resizable, _column$formatter;

      const width = (_column$width = column.width) != null ? _column$width : clampColumnWidth(unallocatedColumnWidth, column, minColumnWidth);
      const newColumn = { ...column,
        idx,
        width,
        left,
        sortable: (_column$sortable = column.sortable) != null ? _column$sortable : defaultSortable,
        resizable: (_column$resizable = column.resizable) != null ? _column$resizable : defaultResizable,
        formatter: (_column$formatter = column.formatter) != null ? _column$formatter : defaultFormatter
      };

      if (newColumn.rowGroup) {
        var _column$groupFormatte;

        groupBy.push(column.key);
        newColumn.groupFormatter = (_column$groupFormatte = column.groupFormatter) != null ? _column$groupFormatte : ToggleGroupFormatter;
      }

      totalWidth += width;
      left = column.frozenAlignment === 'right' ? left : left + width;
      return newColumn;
    });

    if (lastFrozenColumnIndex !== -1) {
      const lastFrozenColumn = calculatedColumns[lastFrozenColumnIndex];
      lastFrozenColumn.isLastFrozenColumn = true;
      totalFrozenColumnWidth = lastFrozenColumn.left + lastFrozenColumn.width;
    }

    return {
      columns: calculatedColumns,
      lastFrozenColumnIndex,
      totalFrozenColumnWidth,
      totalColumnWidth: totalWidth,
      groupBy
    };
  }, [columnWidths, defaultFormatter, defaultResizable, defaultSortable, minColumnWidth, rawColumns, rawGroupBy, viewportWidth]);
  const [colOverscanStartIdx, colOverscanEndIdx] = React.useMemo(() => {
    const viewportLeft = scrollLeft + totalFrozenColumnWidth;
    const viewportRight = scrollLeft + viewportWidth;
    const lastColIdx = columns.length - 1;
    const firstUnfrozenColumnIdx = Math.min(lastFrozenColumnIndex + 1, lastColIdx);

    if (viewportLeft >= viewportRight) {
      return [firstUnfrozenColumnIdx, firstUnfrozenColumnIdx];
    }

    let colVisibleStartIdx = firstUnfrozenColumnIdx;

    while (colVisibleStartIdx < lastColIdx) {
      const {
        left,
        width
      } = columns[colVisibleStartIdx];

      if (left + width > viewportLeft) {
        break;
      }

      colVisibleStartIdx++;
    }

    let colVisibleEndIdx = colVisibleStartIdx;

    while (colVisibleEndIdx < lastColIdx) {
      const {
        left,
        width
      } = columns[colVisibleEndIdx];

      if (left + width >= viewportRight) {
        break;
      }

      colVisibleEndIdx++;
    }

    const colOverscanStartIdx = Math.max(firstUnfrozenColumnIdx, colVisibleStartIdx - 1);
    const colOverscanEndIdx = Math.min(lastColIdx, colVisibleEndIdx + 1);
    return [colOverscanStartIdx, colOverscanEndIdx];
  }, [columns, lastFrozenColumnIndex, scrollLeft, totalFrozenColumnWidth, viewportWidth]);
  const viewportColumns = React.useMemo(() => {
    const viewportColumns = [];

    for (let colIdx = 0; colIdx <= colOverscanEndIdx; colIdx++) {
      const column = columns[colIdx];
      if (colIdx < colOverscanStartIdx && !column.frozen) continue;
      viewportColumns.push(column);
    }

    return viewportColumns;
  }, [colOverscanEndIdx, colOverscanStartIdx, columns]);
  return {
    columns,
    viewportColumns,
    totalColumnWidth,
    lastFrozenColumnIndex,
    totalFrozenColumnWidth,
    groupBy
  };
}

function getSpecifiedWidth({
  key,
  width
}, columnWidths, viewportWidth) {
  if (columnWidths.has(key)) {
    return columnWidths.get(key);
  }

  if (typeof width === 'number') {
    return width;
  }

  if (typeof width === 'string' && /^\d+%$/.test(width)) {
    return Math.floor(viewportWidth * parseInt(width, 10) / 100);
  }

  return undefined;
}

function clampColumnWidth(width, {
  minWidth,
  maxWidth
}, minColumnWidth) {
  width = Math.max(width, minWidth != null ? minWidth : minColumnWidth);

  if (typeof maxWidth === 'number') {
    return Math.min(width, maxWidth);
  }

  return width;
}

const RENDER_BACTCH_SIZE = 8;

function isReadonlyArray(arr) {
  return Array.isArray(arr);
}

function useViewportRows({
  rawRows,
  rowHeight,
  clientHeight,
  scrollTop,
  groupBy,
  rowGrouper,
  expandedGroupIds
}) {
  const [groupedRows, rowsCount] = React.useMemo(() => {
    if (groupBy.length === 0 || !rowGrouper) return [undefined, rawRows.length];

    const groupRows = (rows, [groupByKey, ...remainingGroupByKeys], startRowIndex) => {
      let groupRowsCount = 0;
      const groups = {};

      for (const [key, childRows] of Object.entries(rowGrouper(rows, groupByKey))) {
        const [childGroups, childRowsCount] = remainingGroupByKeys.length === 0 ? [childRows, childRows.length] : groupRows(childRows, remainingGroupByKeys, startRowIndex + groupRowsCount + 1);
        groups[key] = {
          childRows,
          childGroups,
          startRowIndex: startRowIndex + groupRowsCount
        };
        groupRowsCount += childRowsCount + 1;
      }

      return [groups, groupRowsCount];
    };

    return groupRows(rawRows, groupBy, 0);
  }, [groupBy, rowGrouper, rawRows]);
  const [rows, allGroupRows] = React.useMemo(() => {
    const allGroupRows = new Set();
    if (!groupedRows) return [rawRows, allGroupRows];
    const flattenedRows = [];

    const expandGroup = (rows, parentId, level) => {
      if (isReadonlyArray(rows)) {
        flattenedRows.push(...rows);
        return;
      }

      Object.keys(rows).forEach((groupKey, posInSet, keys) => {
        var _expandedGroupIds$has;

        const id = parentId !== undefined ? `${parentId}__${groupKey}` : groupKey;
        const isExpanded = (_expandedGroupIds$has = expandedGroupIds == null ? void 0 : expandedGroupIds.has(id)) != null ? _expandedGroupIds$has : false;
        const {
          childRows,
          childGroups,
          startRowIndex
        } = rows[groupKey];
        const groupRow = {
          id,
          parentId,
          groupKey,
          isExpanded,
          childRows,
          level,
          posInSet,
          startRowIndex,
          setSize: keys.length
        };
        flattenedRows.push(groupRow);
        allGroupRows.add(groupRow);

        if (isExpanded) {
          expandGroup(childGroups, id, level + 1);
        }
      });
    };

    expandGroup(groupedRows, undefined, 0);
    return [flattenedRows, allGroupRows];
  }, [expandedGroupIds, groupedRows, rawRows]);

  const isGroupRow = row => allGroupRows.has(row);

  const overscanThreshold = 4;
  const rowVisibleStartIdx = Math.floor(scrollTop / rowHeight);
  const rowVisibleEndIdx = Math.min(rows.length - 1, Math.floor((scrollTop + clientHeight) / rowHeight));
  const rowOverscanStartIdx = Math.max(0, Math.floor((rowVisibleStartIdx - overscanThreshold) / RENDER_BACTCH_SIZE) * RENDER_BACTCH_SIZE);
  const rowOverscanEndIdx = Math.min(rows.length - 1, Math.ceil((rowVisibleEndIdx + overscanThreshold) / RENDER_BACTCH_SIZE) * RENDER_BACTCH_SIZE);
  return {
    rowOverscanStartIdx,
    rowOverscanEndIdx,
    rows,
    rowsCount,
    isGroupRow
  };
}

function useLatestFunc(fn) {
  const ref = React.useRef(fn);
  React.useEffect(() => {
    ref.current = fn;
  });
  return React.useCallback((...args) => {
    ref.current(...args);
  }, []);
}

function SortableHeaderCell({
  column,
  onSort,
  sortColumn,
  sortDirection,
  children
}) {
  sortDirection = sortColumn === column.key && sortDirection || 'NONE';
  let sortText = '';

  if (sortDirection === 'ASC') {
    sortText = '\u25B2';
  } else if (sortDirection === 'DESC') {
    sortText = '\u25BC';
  }

  function onClick() {
    if (!onSort) return;
    const {
      sortDescendingFirst
    } = column;
    let direction;

    switch (sortDirection) {
      case 'ASC':
        direction = sortDescendingFirst ? 'NONE' : 'DESC';
        break;

      case 'DESC':
        direction = sortDescendingFirst ? 'ASC' : 'NONE';
        break;

      default:
        direction = sortDescendingFirst ? 'DESC' : 'ASC';
        break;
    }

    onSort(column.key, direction);
  }

  return /*#__PURE__*/React.createElement("span", {
    className: "rdg-header-sort-cell",
    onClick: onClick
  }, /*#__PURE__*/React.createElement("span", {
    className: "rdg-header-sort-name"
  }, children), /*#__PURE__*/React.createElement("span", null, sortText));
}

function getAriaSort(sortDirection) {
  switch (sortDirection) {
    case 'ASC':
      return 'ascending';

    case 'DESC':
      return 'descending';

    default:
      return 'none';
  }
}

function HeaderCell({
  column,
  onResize,
  allRowsSelected,
  onAllRowsSelectionChange,
  sortColumn,
  sortDirection,
  gridWidth,
  scrollLeft,
  onSort,
  scrolledToEnd
}) {
  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.buttons !== 1) {
      return;
    }

    const {
      currentTarget,
      pointerId
    } = event;
    const {
      right
    } = currentTarget.getBoundingClientRect();
    const offset = right - event.clientX;

    if (offset > 11) {
      return;
    }

    function onPointerMove(event) {
      if (event.pointerId !== pointerId) return;

      if (event.pointerType === 'mouse' && event.buttons !== 1) {
        onPointerUp();
        return;
      }

      const width = event.clientX + offset - currentTarget.getBoundingClientRect().left;

      if (width > 0) {
        onResize(column, width);
      }
    }

    function onPointerUp() {
      if (event.pointerId !== pointerId) return;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }

    event.preventDefault();
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function getCell() {
    if (column.headerRenderer) {
      return /*#__PURE__*/React.createElement(column.headerRenderer, {
        column: column,
        sortColumn: sortColumn,
        sortDirection: sortDirection,
        onSort: onSort,
        allRowsSelected: allRowsSelected,
        onAllRowsSelectionChange: onAllRowsSelectionChange
      });
    }

    if (column.sortable) {
      return /*#__PURE__*/React.createElement(SortableHeaderCell, {
        column: column,
        onSort: onSort,
        sortColumn: sortColumn,
        sortDirection: sortDirection
      }, column.name);
    }

    return column.name;
  }

  const className = clsx('rdg-cell', column.headerCellClass, column.resizable && 'rdg-cell-resizable', column.frozen && 'rdg-cell-frozen', column.isLastFrozenColumn && scrollLeft > 0 && 'rdg-cell-frozen-last', column.frozenAlignment === 'right' && 'rdg-cell-frozen-align-right' + (scrolledToEnd ? " rdg-cell-frozen-align-right-no-shadow" : ""), column.alignment === 'right' && 'rdg-cell-align-right');
  const style = column.frozenAlignment === 'right' ? {
    width: column.width,
    left: gridWidth - column.width
  } : {
    width: column.width,
    left: column.left
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "columnheader",
    "aria-colindex": column.idx + 1,
    "aria-sort": sortColumn === column.key ? getAriaSort(sortDirection) : undefined,
    className: className,
    style: style,
    onPointerDown: column.resizable ? onPointerDown : undefined
  }, /*#__PURE__*/React.createElement("div", {
    className: 'rdg-cell-fake-background'
  }), getCell());
}

function getColumnScrollPosition(columns, idx, currentScrollLeft, currentClientWidth) {
  let left = 0;
  let frozen = 0;

  for (let i = 0; i < idx; i++) {
    const column = columns[i];

    if (column) {
      if (column.width) {
        left += column.width;
      }

      if (column.frozen) {
        frozen += column.width;
      }
    }
  }

  const selectedColumn = columns[idx];

  if (selectedColumn) {
    const scrollLeft = left - frozen - currentScrollLeft;
    const scrollRight = left + selectedColumn.width - currentScrollLeft;

    if (scrollLeft < 0) {
      return scrollLeft;
    }

    if (scrollRight > currentClientWidth) {
      return scrollRight - currentClientWidth;
    }
  }

  return 0;
}
function onEditorNavigation({
  key,
  target
}) {
  if (key === 'Tab' && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
    return target.matches('.rdg-editor-container > :only-child, .rdg-editor-container > label:only-child > :only-child');
  }

  return false;
}

const nonInputKeys = new Set(['Unidentified', 'Alt', 'AltGraph', 'CapsLock', 'Control', 'Fn', 'FnLock', 'Meta', 'NumLock', 'ScrollLock', 'Shift', 'Tab', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', 'Insert', 'ContextMenu', 'Escape', 'Pause', 'Play', 'PrintScreen', 'F1', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']);
function isCtrlKeyHeldDown(e) {
  return (e.ctrlKey || e.metaKey) && e.key !== 'Control';
}
function isDefaultCellInput(event) {
  return !nonInputKeys.has(event.key);
}

function isSelectedCellEditable({
  selectedPosition,
  columns,
  rows,
  isGroupRow
}) {
  const column = columns[selectedPosition.idx];
  const row = rows[selectedPosition.rowIdx];
  return column.editor != null && !column.rowGroup && !isGroupRow(row) && (typeof column.editable === 'function' ? column.editable(row) : column.editable) !== false;
}
function getNextSelectedCellPosition({
  cellNavigationMode,
  columns,
  rowsCount,
  nextPosition
}) {
  if (cellNavigationMode !== 'NONE') {
    const {
      idx,
      rowIdx
    } = nextPosition;
    const columnsCount = columns.length;
    const isAfterLastColumn = idx === columnsCount;
    const isBeforeFirstColumn = idx === -1;

    if (isAfterLastColumn) {
      if (cellNavigationMode === 'CHANGE_ROW') {
        const isLastRow = rowIdx === rowsCount - 1;

        if (!isLastRow) {
          return {
            idx: 0,
            rowIdx: rowIdx + 1
          };
        }
      } else if (cellNavigationMode === 'LOOP_OVER_ROW') {
        return {
          rowIdx,
          idx: 0
        };
      }
    } else if (isBeforeFirstColumn) {
      if (cellNavigationMode === 'CHANGE_ROW') {
        const isFirstRow = rowIdx === 0;

        if (!isFirstRow) {
          return {
            rowIdx: rowIdx - 1,
            idx: columnsCount - 1
          };
        }
      } else if (cellNavigationMode === 'LOOP_OVER_ROW') {
        return {
          rowIdx,
          idx: columnsCount - 1
        };
      }
    }
  }

  return nextPosition;
}
function canExitGrid({
  cellNavigationMode,
  columns,
  rowsCount,
  selectedPosition: {
    rowIdx,
    idx
  },
  shiftKey
}) {
  if (cellNavigationMode === 'NONE' || cellNavigationMode === 'CHANGE_ROW') {
    const atLastCellInRow = idx === columns.length - 1;
    const atFirstCellInRow = idx === 0;
    const atLastRow = rowIdx === rowsCount - 1;
    const atFirstRow = rowIdx === 0;
    return shiftKey ? atFirstCellInRow && atFirstRow : atLastCellInRow && atLastRow;
  }

  return false;
}
function checkIfCellDisabled(cell) {
  if (!cell) return false;

  if (typeof cell === 'string' || !cell.disabled) {
    return false;
  }

  return true;
}

function assertIsValidKeyGetter(keyGetter) {
  if (typeof keyGetter !== 'function') {
    throw new Error('Please specify the rowKeyGetter prop to use selection');
  }
}

function HeaderRow({
  columns,
  rows,
  rowKeyGetter,
  onSelectedRowsChange,
  allRowsSelected,
  onColumnResize,
  sortColumn,
  sortDirection,
  gridWidth,
  onSort,
  scrollLeft,
  scrolledToEnd,
  enableOptionsCol,
  optionsCol
}) {
  const handleAllRowsSelectionChange = React.useCallback(checked => {
    if (!onSelectedRowsChange) return;
    assertIsValidKeyGetter(rowKeyGetter);
    const newSelectedRows = new Set();

    if (checked) {
      for (const row of rows) {
        newSelectedRows.add(rowKeyGetter(row));
      }
    }

    onSelectedRowsChange(newSelectedRows);
  }, [onSelectedRowsChange, rows, rowKeyGetter]);
  return /*#__PURE__*/React.createElement("div", {
    role: "row",
    "aria-rowindex": 1,
    className: "rdg-header-row"
  }, columns.map(column => {
    return column.key !== 'options' && /*#__PURE__*/React.createElement(HeaderCell, {
      key: column.key,
      column: column,
      onResize: onColumnResize,
      allRowsSelected: allRowsSelected,
      onAllRowsSelectionChange: handleAllRowsSelectionChange,
      onSort: onSort,
      sortColumn: sortColumn,
      sortDirection: sortDirection,
      gridWidth: gridWidth,
      scrollLeft: scrollLeft,
      scrolledToEnd: scrolledToEnd
    });
  }), enableOptionsCol && optionsCol && /*#__PURE__*/React.createElement(HeaderCell, {
    key: optionsCol.key,
    column: optionsCol,
    onResize: onColumnResize,
    allRowsSelected: allRowsSelected,
    onAllRowsSelectionChange: handleAllRowsSelectionChange,
    onSort: onSort,
    sortColumn: sortColumn,
    sortDirection: sortDirection,
    gridWidth: gridWidth,
    scrollLeft: scrollLeft,
    scrolledToEnd: scrolledToEnd
  }));
}

const HeaderRow$1 = /*#__PURE__*/React.memo(HeaderRow);

function FilterRow({
  columns,
  filters,
  onFiltersChange
}) {
  function onChange(key, value) {
    const newFilters = { ...filters
    };
    newFilters[key] = value;
    onFiltersChange == null ? void 0 : onFiltersChange(newFilters);
  }

  return /*#__PURE__*/React.createElement("div", {
    role: "row",
    "aria-rowindex": 2,
    className: "rdg-filter-row"
  }, columns.map(column => {
    const {
      key
    } = column;
    const className = clsx('rdg-cell', column.frozen && 'rdg-cell-frozen', column.isLastFrozenColumn && 'rdg-cell-frozen-last');
    const style = {
      width: column.width,
      left: column.left
    };
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      style: style,
      className: className
    }, column.filterRenderer && /*#__PURE__*/React.createElement(column.filterRenderer, {
      column: column,
      value: filters == null ? void 0 : filters[column.key],
      onChange: value => onChange(key, value)
    }));
  }));
}

const FilterRow$1 = /*#__PURE__*/React.memo(FilterRow);

function Cell({
  className,
  column,
  isCellSelected,
  isCopied,
  isDraggedOver,
  isRowSelected,
  row,
  rowIdx,
  dragHandleProps,
  onDoubleClick,
  onRowChange,
  selectCell,
  handleCellMouseDown,
  selectedPosition,
  selectRow,
  handleDragEnter,
  draggedOverRowIdx,
  draggedOverColumnIdx,
  hasFirstCopiedCell,
  hasLastCopiedCell,
  isFilling,
  bottomRowIdx,
  selectedCellsInfo,
  gridWidth,
  scrolledToEnd,
  cell,
  scrollLeft,
  expandRow
}, ref) {
  const cellRef = React.useRef(null);
  const disabled = checkIfCellDisabled(cell);
  const error = typeof cell === 'object' && cell.error;
  const alert = typeof cell === 'object' && cell.alert;
  const warning = typeof cell === 'object' && cell.warning;
  const {
    frozen
  } = column;
  const frozenRightAlign = column.frozenAlignment && column.frozenAlignment === 'right';
  const hasChildren = row.children && row.children.length > 0;
  const {
    cellClass
  } = column;
  className = clsx('rdg-cell', typeof cellClass === 'function' ? cellClass(row) : cellClass, className, disabled ? 'rdg-cell-disabled' : isCopied && 'rdg-cell-copied', alert ? 'rdg-cell-alert' : checkIsDraggedOver(true) && 'rdg-cell-dragged-over', frozenRightAlign && 'rdg-cell-frozen-align-right' + (scrolledToEnd ? " rdg-cell-frozen-align-right-no-shadow" : ""), column.frozen && 'rdg-cell-frozen', column.isLastFrozenColumn && scrollLeft > 0 && 'rdg-cell-frozen-last', isCellSelected && 'rdg-cell-selected', error && 'rdg-cell-error', warning && 'rdg-cell-warning', hasChildren && 'rdg-cell-children', column.alignment === 'right' && 'rdg-cell-align-right');
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [reference, setReference] = React.useState(null);
  const [popper, setPopper] = React.useState(null);
  const {
    styles
  } = reactPopper.usePopper(reference, popper, {
    placement: 'top',
    modifiers: [{
      name: 'offset',
      options: {
        offset: [0, 8]
      }
    }]
  });

  function checkIsDraggedOver(shouldCareIfDisabled) {
    if (shouldCareIfDisabled && disabled) {
      return false;
    }

    if (frozen != null ? frozen : !isDraggedOver) {
      return false;
    }

    if (selectedCellsInfo === selectedPosition.rowIdx && isFilling) {
      return false;
    }

    if (selectedCellsInfo !== selectedPosition.rowIdx && column.idx !== (draggedOverColumnIdx == null ? void 0 : draggedOverColumnIdx[0]) && isFilling) {
      return false;
    }

    return isDraggedOver;
  }

  function selectCellWrapper(openEditor) {
    if (!dragHandleProps) {
      selectCell({
        idx: column.idx,
        rowIdx
      }, openEditor);
    }

    if (dragHandleProps && openEditor) {
      selectCell({
        idx: column.idx,
        rowIdx
      }, openEditor);
    }
  }

  function handleMouseDown(event) {
    event.preventDefault();
    if (event.buttons === 2) return;
    if (disabled || frozenRightAlign) return;
    selectCellWrapper(false);
    handleCellMouseDown(event);
  }

  function handleMouseEnter(event) {
    if (event.buttons === 1) {
      handleDragEnter(column.idx);
    }

    if (alert != null ? alert : warning) {
      setShowTooltip(true);
    }
  }

  function handleMouseLeave() {
    if (alert != null ? alert : warning) {
      setShowTooltip(false);
    }
  }

  function handleDoubleClick() {
    if (!disabled && !frozen && !frozenRightAlign) {
      selectCellWrapper(true);
    }
  }

  function handleRowChange(newRow) {
    onRowChange(rowIdx, newRow);
  }

  function onRowSelectionChange(checked, isShiftClick) {
    selectRow({
      rowIdx,
      checked,
      isShiftClick
    });
  }

  function checkForTopActiveBorder() {
    if (isFilling) {
      if (selectedPosition.rowIdx === rowIdx && isDraggedOver && selectedPosition.rowIdx !== bottomRowIdx) {
        return true;
      }

      if (selectedPosition.rowIdx === bottomRowIdx && isDraggedOver && draggedOverRowIdx === rowIdx && !checkIsDraggedOver()) {
        return true;
      }
    }

    if (isCopied && hasFirstCopiedCell) {
      return true;
    }

    return false;
  }

  function checkForBottomActiveBorder() {
    if (isFilling && rowIdx === bottomRowIdx && !checkIsDraggedOver() && isDraggedOver) {
      return true;
    }

    if (isCopied && hasLastCopiedCell) {
      return true;
    }

    return false;
  }

  function checkForRightActiveBorder() {
    if (isFilling && draggedOverColumnIdx && draggedOverColumnIdx[draggedOverColumnIdx.length - 1] === column.idx && isDraggedOver && !checkIsDraggedOver()) {
      return true;
    }

    if (isCopied) {
      return true;
    }

    return false;
  }

  function checkForLeftActiveBorder() {
    if (isFilling && draggedOverColumnIdx && draggedOverColumnIdx[0] === column.idx && isDraggedOver && !checkIsDraggedOver()) {
      return true;
    }

    if (isCopied) {
      return true;
    }

    return false;
  }

  function handleClickToExpand() {
    if (column.key !== 'name') return;
    if (!expandRow) return;
    if (!hasChildren) return;
    expandRow(row);
  }

  return /*#__PURE__*/React.createElement("div", {
    role: "gridcell",
    "aria-colindex": column.idx + 1,
    "aria-selected": isCellSelected,
    ref: useCombinedRefs(cellRef, ref),
    className: className,
    style: column.frozenAlignment === 'right' ? {
      width: column.width,
      left: gridWidth - column.width
    } : {
      width: column.width,
      left: column.left
    },
    onMouseDown: handleMouseDown,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onDoubleClick: wrapEvent(handleDoubleClick, onDoubleClick),
    onClick: handleClickToExpand
  }, !column.rowGroup && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: clsx('rdg-cell-fake-background', checkForTopActiveBorder() && 'rdg-cell-fake-background-active-top', checkForBottomActiveBorder() && 'rdg-cell-fake-background-active-bottom', checkForRightActiveBorder() && 'rdg-cell-fake-background-active-right', checkForLeftActiveBorder() && 'rdg-cell-fake-background-active-left'),
    ref: setReference
  }), /*#__PURE__*/React.createElement(column.formatter, {
    rowIdx: rowIdx,
    cell: cell,
    row: row,
    isCellSelected: isCellSelected,
    isRowSelected: isRowSelected,
    onRowSelectionChange: onRowSelectionChange,
    onRowChange: handleRowChange
  }), dragHandleProps && !disabled && !frozenRightAlign && !frozen && /*#__PURE__*/React.createElement("div", {
    className: "rdg-cell-drag-handle",
    ...dragHandleProps
  })), (alert || warning) && showTooltip && /*#__PURE__*/reactDom.createPortal( /*#__PURE__*/React.createElement("div", {
    ref: setPopper,
    className: warning ? 'rdg-warning' : 'rdg-alert',
    style: styles.popper
  }, alert != null ? alert : warning), document.body));
}

const Cell$1 = /*#__PURE__*/React.memo( /*#__PURE__*/React.forwardRef(Cell));

function EditorContainer({
  row,
  column,
  onRowChange,
  ...props
}) {
  var _column$editorOptions;

  const onClickCapture = useClickOutside(() => onRowChange(row, true));
  if (column.editor === undefined) return null;
  const editor = /*#__PURE__*/React.createElement("div", {
    className: "rdg-editor-container",
    onClickCapture: onClickCapture
  }, /*#__PURE__*/React.createElement(column.editor, {
    row: row,
    column: column,
    onRowChange: onRowChange,
    ...props
  }));

  if ((_column$editorOptions = column.editorOptions) != null && _column$editorOptions.createPortal) {
    return /*#__PURE__*/reactDom.createPortal(editor, props.editorPortalTarget);
  }

  return editor;
}

function EditCell({
  className,
  column,
  row,
  rowIdx,
  editorProps,
  ...props
}) {
  const [dimensions, setDimensions] = React.useState(null);
  const cellRef = React.useCallback(node => {
    if (node !== null) {
      const {
        left,
        top
      } = node.getBoundingClientRect();
      setDimensions({
        left,
        top
      });
    }
  }, []);
  const {
    cellClass
  } = column;
  className = clsx("rdg-cell rdg-cell-selected rdg-cell-editing", typeof cellClass === 'function' ? cellClass(row) : cellClass, className, column.frozen && 'rdg-cell-frozen', column.isLastFrozenColumn && 'rdg-cell-frozen-last');

  function getCellContent() {
    var _document$scrollingEl;

    if (dimensions === null) return;
    const {
      scrollTop: docTop,
      scrollLeft: docLeft
    } = (_document$scrollingEl = document.scrollingElement) != null ? _document$scrollingEl : document.documentElement;
    const {
      left,
      top
    } = dimensions;
    const gridLeft = left + docLeft;
    const gridTop = top + docTop;
    return /*#__PURE__*/React.createElement(EditorContainer, { ...editorProps,
      rowIdx: rowIdx,
      column: column,
      left: gridLeft,
      top: gridTop
    });
  }

  return /*#__PURE__*/React.createElement("div", {
    role: "gridcell",
    "aria-colindex": column.idx + 1,
    "aria-selected": true,
    ref: cellRef,
    className: className,
    style: {
      width: column.width,
      left: column.left
    },
    ...props
  }, getCellContent());
}

function Row({
  cellRenderer: CellRenderer = Cell$1,
  className,
  id,
  rowIdx,
  isRowSelected,
  copiedCellIdx,
  getDraggedOverCellIdx,
  row,
  viewportColumns,
  selectedCellProps,
  selectedPosition,
  isFilling,
  isMultipleRows,
  onRowClick,
  rowClass,
  selectedCellsInfo,
  setDraggedOverRowIdx,
  setDraggedOverColumnIdx,
  hasFirstCopiedCell,
  hasLastCopiedCell,
  top,
  onRowChange,
  selectCell,
  selectRow,
  handleCellMouseDown,
  bottomRowIdx,
  dragHandleProps,
  draggedOverRowIdx,
  draggedOverColumnIdx,
  gridWidth,
  scrollLeft,
  scrolledToEnd,
  expandRow,
  enableOptionsCol,
  optionsCol,
  'aria-rowindex': ariaRowIndex,
  'aria-selected': ariaSelected,
  ...props
}, ref) {
  function handleDragEnter(colIdx) {
    if (isFilling && typeof selectedCellsInfo === 'number') {
      if (selectedCellsInfo === selectedPosition.rowIdx) {
        if (colIdx === selectedPosition.idx) {
          setDraggedOverRowIdx == null ? void 0 : setDraggedOverRowIdx(rowIdx);
        } else {
          setDraggedOverRowIdx == null ? void 0 : setDraggedOverRowIdx(selectedCellsInfo);
        }
      } else {
        setDraggedOverRowIdx == null ? void 0 : setDraggedOverRowIdx(selectedCellsInfo);
      }
    } else {
      setDraggedOverRowIdx == null ? void 0 : setDraggedOverRowIdx(rowIdx);
    }

    if (isFilling) {
      setDraggedOverColumnIdx == null ? void 0 : setDraggedOverColumnIdx(colIdx);
    } else {
      setDraggedOverColumnIdx == null ? void 0 : setDraggedOverColumnIdx(selectedPosition.idx);
    }
  }

  function hasJustFilled() {
    if (draggedOverColumnIdx && draggedOverColumnIdx.length > 1 && !isFilling) {
      return true;
    }

    return false;
  }

  className = clsx(`rdg-row rdg-row-${rowIdx % 2 === 0 ? 'even' : 'odd'}`, rowClass == null ? void 0 : rowClass(row), className, isRowSelected && 'rdg-row-selected', (selectedCellProps == null ? void 0 : selectedCellProps.idx) === -1 && 'rdg-group-row-selected');
  return /*#__PURE__*/React.createElement("div", {
    role: "row",
    "aria-rowindex": ariaRowIndex,
    "aria-selected": ariaSelected,
    ref: ref,
    className: className,
    style: {
      top
    },
    ...props
  }, viewportColumns.map(column => {
    const isCellSelected = (selectedCellProps == null ? void 0 : selectedCellProps.idx) === column.idx;
    const isBottomCell = rowIdx === bottomRowIdx && column.idx === selectedPosition.idx;
    const cell = row[column.key];
    const cellCanBeEdited = !checkIfCellDisabled(cell);

    if ((selectedCellProps == null ? void 0 : selectedCellProps.mode) === 'EDIT' && isCellSelected && cellCanBeEdited) {
      return /*#__PURE__*/React.createElement(EditCell, {
        key: column.key,
        rowIdx: rowIdx,
        column: column,
        row: row,
        onKeyDown: selectedCellProps.onKeyDown,
        editorProps: selectedCellProps.editorProps
      });
    }

    return column.key !== 'options' && /*#__PURE__*/React.createElement(CellRenderer, {
      key: column.key,
      rowIdx: rowIdx,
      column: column,
      row: row,
      cell: cell,
      isCopied: copiedCellIdx === column.idx,
      hasFirstCopiedCell: hasFirstCopiedCell,
      hasLastCopiedCell: hasLastCopiedCell,
      isDraggedOver: getDraggedOverCellIdx(rowIdx, column.idx) === column.idx,
      isCellSelected: isCellSelected,
      isRowSelected: isRowSelected,
      dragHandleProps: isBottomCell && !hasJustFilled() ? dragHandleProps : undefined,
      onFocus: isCellSelected ? selectedCellProps.onFocus : undefined,
      onKeyDown: isCellSelected ? selectedCellProps.onKeyDown : undefined,
      onRowClick: onRowClick,
      onRowChange: onRowChange,
      selectCell: selectCell,
      selectRow: selectRow,
      handleCellMouseDown: handleCellMouseDown,
      handleDragEnter: handleDragEnter,
      selectedPosition: selectedPosition,
      draggedOverRowIdx: draggedOverRowIdx,
      draggedOverColumnIdx: draggedOverColumnIdx,
      isFilling: isFilling,
      bottomRowIdx: bottomRowIdx,
      selectedCellsInfo: selectedCellsInfo,
      gridWidth: gridWidth,
      scrollLeft: scrollLeft,
      scrolledToEnd: scrolledToEnd,
      expandRow: expandRow
    });
  }), enableOptionsCol && optionsCol && /*#__PURE__*/React.createElement(CellRenderer, {
    key: optionsCol.key,
    rowIdx: rowIdx,
    column: optionsCol,
    row: row,
    isCopied: false,
    isDraggedOver: false,
    isCellSelected: false,
    cell: row[optionsCol.key],
    hasFirstCopiedCell: hasFirstCopiedCell,
    hasLastCopiedCell: hasLastCopiedCell,
    isRowSelected: isRowSelected,
    dragHandleProps: undefined,
    onFocus: undefined,
    onKeyDown: undefined,
    onRowClick: onRowClick,
    onRowChange: onRowChange,
    selectCell: selectCell,
    selectRow: selectRow,
    handleCellMouseDown: handleCellMouseDown,
    handleDragEnter: handleDragEnter,
    selectedPosition: selectedPosition,
    draggedOverRowIdx: draggedOverRowIdx,
    draggedOverColumnIdx: draggedOverColumnIdx,
    isFilling: isFilling,
    bottomRowIdx: bottomRowIdx,
    selectedCellsInfo: selectedCellsInfo,
    gridWidth: gridWidth,
    scrollLeft: scrollLeft,
    scrolledToEnd: scrolledToEnd,
    expandRow: expandRow
  }));
}

const Row$1 = /*#__PURE__*/React.memo( /*#__PURE__*/React.forwardRef(Row));

function GroupCell({
  id,
  rowIdx,
  groupKey,
  childRows,
  isExpanded,
  isCellSelected,
  isRowSelected,
  column,
  groupColumnIndex,
  selectRow,
  toggleGroup: toggleGroupWrapper
}) {
  function toggleGroup() {
    toggleGroupWrapper(id);
  }

  function onRowSelectionChange(checked) {
    selectRow({
      rowIdx,
      checked,
      isShiftClick: false
    });
  }

  const isLevelMatching = column.rowGroup && groupColumnIndex === column.idx;
  return /*#__PURE__*/React.createElement("div", {
    role: "gridcell",
    "aria-colindex": column.idx + 1,
    key: column.key,
    className: clsx('rdg-cell', column.frozen && 'rdg-cell-frozen', column.isLastFrozenColumn && 'rdg-cell-frozen-last', isCellSelected && 'rdg-cell-selected'),
    style: {
      width: column.width,
      left: column.left,
      cursor: isLevelMatching ? 'pointer' : 'default'
    },
    onClick: isLevelMatching ? toggleGroup : undefined
  }, column.groupFormatter && (!column.rowGroup || groupColumnIndex === column.idx) && /*#__PURE__*/React.createElement(column.groupFormatter, {
    groupKey: groupKey,
    childRows: childRows,
    column: column,
    isExpanded: isExpanded,
    isCellSelected: isCellSelected,
    isRowSelected: isRowSelected,
    onRowSelectionChange: onRowSelectionChange,
    toggleGroup: toggleGroup
  }));
}

const GroupCell$1 = /*#__PURE__*/React.memo(GroupCell);

function GroupedRow({
  id,
  groupKey,
  viewportColumns,
  childRows,
  rowIdx,
  top,
  level,
  isExpanded,
  selectedCellIdx,
  isRowSelected,
  selectCell,
  selectRow,
  toggleGroup,
  ...props
}) {
  const idx = viewportColumns[0].key === SELECT_COLUMN_KEY ? level + 1 : level;

  function selectGroup() {
    selectCell({
      rowIdx,
      idx: -1
    });
  }

  return /*#__PURE__*/React.createElement("div", {
    role: "row",
    "aria-level": level,
    "aria-expanded": isExpanded,
    className: clsx(`rdg-row rdg-group-row rdg-row-${rowIdx % 2 === 0 ? 'even' : 'odd'}`, isRowSelected && 'rdg-row-selected', selectedCellIdx === -1 && 'rdg-group-row-selected'),
    onClick: selectGroup,
    style: {
      top
    },
    ...props
  }, viewportColumns.map(column => /*#__PURE__*/React.createElement(GroupCell$1, {
    key: column.key,
    id: id,
    rowIdx: rowIdx,
    groupKey: groupKey,
    childRows: childRows,
    isExpanded: isExpanded,
    isRowSelected: isRowSelected,
    isCellSelected: selectedCellIdx === column.idx,
    column: column,
    groupColumnIndex: idx,
    selectRow: selectRow,
    toggleGroup: toggleGroup
  })));
}

const GroupRowRenderer = /*#__PURE__*/React.memo(GroupedRow);

function SummaryCell({
  column,
  row
}) {
  const {
    summaryFormatter: SummaryFormatter,
    width,
    left,
    summaryCellClass
  } = column;
  const className = clsx('rdg-cell', typeof summaryCellClass === 'function' ? summaryCellClass(row) : summaryCellClass, column.frozen && 'rdg-cell-frozen', column.isLastFrozenColumn && 'rdg-cell-frozen-last');
  return /*#__PURE__*/React.createElement("div", {
    role: "gridcell",
    "aria-colindex": column.idx + 1,
    className: className,
    style: {
      width,
      left
    }
  }, SummaryFormatter && /*#__PURE__*/React.createElement(SummaryFormatter, {
    column: column,
    row: row
  }));
}

const SummaryCell$1 = /*#__PURE__*/React.memo(SummaryCell);

function SummaryRow({
  rowIdx,
  row,
  viewportColumns,
  bottom,
  'aria-rowindex': ariaRowIndex
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "row",
    "aria-rowindex": ariaRowIndex,
    className: `rdg-row rdg-row-${rowIdx % 2 === 0 ? 'even' : 'odd'} rdg-summary-row`,
    style: {
      bottom
    }
  }, viewportColumns.map(column => /*#__PURE__*/React.createElement(SummaryCell$1, {
    key: column.key,
    column: column,
    row: row
  })));
}

const SummaryRow$1 = /*#__PURE__*/React.memo(SummaryRow);

var _globalThis$document;
const body = (_globalThis$document = globalThis.document) == null ? void 0 : _globalThis$document.body;

function DataGrid({
  columns: rawColumns,
  rows: rawRows,
  summaryRows,
  rowKeyGetter,
  onRowsChange,
  rowHeight = 35,
  headerRowHeight = rowHeight,
  headerFiltersHeight = 45,
  selectedRows,
  onSelectedRowsChange,
  sortColumn,
  sortDirection,
  onSort,
  filters,
  onFiltersChange,
  defaultColumnOptions,
  groupBy: rawGroupBy,
  rowGrouper,
  expandedGroupIds,
  onExpandedGroupIdsChange,
  rowRenderer: RowRenderer = Row$1,
  emptyRowsRenderer: EmptyRowsRenderer,
  onRowClick,
  onScroll,
  onColumnResize,
  onSelectedCellChange,
  onFill,
  onPaste,
  enableFilterRow = false,
  cellNavigationMode = 'NONE',
  editorPortalTarget = body,
  className,
  style,
  rowClass,
  enableOptionsCol,
  expandRow,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy
}, ref) {
  var _summaryRows$length;

  const [scrollTop, setScrollTop] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [columnWidths, setColumnWidths] = React.useState(() => new Map());
  const [selectedPosition, setSelectedPosition] = React.useState({
    idx: -1,
    rowIdx: -1,
    mode: 'SELECT'
  });
  const [copiedCells, setCopiedCells] = React.useState(null);
  const [isDragging, setDragging] = React.useState(false);
  const [isFilling, setFilling] = React.useState(false);
  const [selectedCellsInfo, setSelectedCells] = React.useState(undefined);
  const [draggedOverRowIdx, setOverRowIdx] = React.useState(undefined);
  const [draggedOverColumnIdx, setOverColIdx] = React.useState(undefined);
  const focusSinkRef = React.useRef(null);
  const prevSelectedPosition = React.useRef(selectedPosition);
  const latestDraggedOverRowIdx = React.useRef(draggedOverRowIdx);
  const lastSelectedRowIdx = React.useRef(-1);
  const isCellFocusable = React.useRef(false);
  const firstSelectedColIdx = React.useRef(-1);
  const latestDraggedOverColIdx = React.useRef(-1);
  const selectRowWrapper = useLatestFunc(selectRow);
  const selectCellWrapper = useLatestFunc(selectCell);
  const toggleGroupWrapper = useLatestFunc(toggleGroup);
  const handleFormatterRowChangeWrapper = useLatestFunc(handleFormatterRowChange);
  const [gridRef, gridWidth, gridHeight] = useGridDimensions();
  const headerRowsCount = enableFilterRow ? 2 : 1;
  const summaryRowsCount = (_summaryRows$length = summaryRows == null ? void 0 : summaryRows.length) != null ? _summaryRows$length : 0;
  const totalHeaderHeight = headerRowHeight + (enableFilterRow ? headerFiltersHeight : 0);
  const clientHeight = gridHeight - totalHeaderHeight - summaryRowsCount * rowHeight;
  const isSelectable = selectedRows !== undefined && onSelectedRowsChange !== undefined;
  const {
    columns,
    viewportColumns,
    totalColumnWidth,
    lastFrozenColumnIndex,
    totalFrozenColumnWidth,
    groupBy
  } = useViewportColumns({
    rawColumns,
    columnWidths,
    scrollLeft,
    viewportWidth: gridWidth,
    defaultColumnOptions,
    rawGroupBy: rowGrouper ? rawGroupBy : undefined
  });
  const {
    rowOverscanStartIdx,
    rowOverscanEndIdx,
    rows,
    rowsCount,
    isGroupRow
  } = useViewportRows({
    rawRows,
    groupBy,
    rowGrouper,
    rowHeight,
    clientHeight,
    scrollTop,
    expandedGroupIds
  });
  const hasGroups = groupBy.length > 0 && rowGrouper;
  const minColIdx = hasGroups ? -1 : 0;
  const enableCellDragAndDrop = hasGroups ? false : onFill !== undefined;
  React.useLayoutEffect(() => {
    if (selectedPosition === prevSelectedPosition.current || selectedPosition.mode === 'EDIT' || !isCellWithinBounds(selectedPosition)) return;
    prevSelectedPosition.current = selectedPosition;
    scrollToCell(selectedPosition);

    if (isCellFocusable.current) {
      isCellFocusable.current = false;
      return;
    }

    focusSinkRef.current.focus({
      preventScroll: true
    });
  });
  React.useImperativeHandle(ref, () => ({
    scrollToColumn(idx) {
      scrollToCell({
        idx
      });
    },

    scrollToRow(rowIdx) {
      const {
        current
      } = gridRef;
      if (!current) return;
      current.scrollTo({
        top: rowIdx * rowHeight,
        behavior: 'smooth'
      });
    },

    selectCell
  }));
  const handleColumnResize = React.useCallback((column, width) => {
    const newColumnWidths = new Map(columnWidths);
    newColumnWidths.set(column.key, width);
    setColumnWidths(newColumnWidths);
    onColumnResize == null ? void 0 : onColumnResize(column.idx, width);
  }, [columnWidths, onColumnResize]);
  const setDraggedOverRowIdx = React.useCallback(rowIdx => {
    setOverRowIdx(rowIdx);
    latestDraggedOverRowIdx.current = rowIdx;
  }, []);
  const setDraggedOverColumnIdx = React.useCallback(colIdx => {
    const selectedCellColIdx = firstSelectedColIdx.current;
    if (draggedOverColumnIdx && !draggedOverColumnIdx.some(i => i === colIdx)) return;

    if (!colIdx && selectedCellColIdx) {
      setOverColIdx([selectedCellColIdx]);
      latestDraggedOverColIdx.current = selectedCellColIdx;
    }

    if (colIdx) {
      const colIdxArray = [];

      for (let i = selectedCellColIdx; i <= colIdx; i++) {
        colIdxArray.push(i);
      }

      latestDraggedOverColIdx.current = colIdx;
      setOverColIdx(colIdxArray);
    }
  }, []);

  function selectRow({
    rowIdx,
    checked,
    isShiftClick
  }) {
    if (!onSelectedRowsChange) return;
    assertIsValidKeyGetter(rowKeyGetter);
    const newSelectedRows = new Set(selectedRows);
    const row = rows[rowIdx];

    if (isGroupRow(row)) {
      for (const childRow of row.childRows) {
        const rowKey = rowKeyGetter(childRow);

        if (checked) {
          newSelectedRows.add(rowKey);
        } else {
          newSelectedRows.delete(rowKey);
        }
      }

      onSelectedRowsChange(newSelectedRows);
      return;
    }

    const rowKey = rowKeyGetter(row);

    if (checked) {
      newSelectedRows.add(rowKey);
      const previousRowIdx = lastSelectedRowIdx.current;
      lastSelectedRowIdx.current = rowIdx;

      if (isShiftClick && previousRowIdx !== -1 && previousRowIdx !== rowIdx) {
        const step = Math.sign(rowIdx - previousRowIdx);

        for (let i = previousRowIdx + step; i !== rowIdx; i += step) {
          const row = rows[i];
          if (isGroupRow(row)) continue;
          newSelectedRows.add(rowKeyGetter(row));
        }
      }
    } else {
      newSelectedRows.delete(rowKey);
      lastSelectedRowIdx.current = -1;
    }

    onSelectedRowsChange(newSelectedRows);
  }

  function toggleGroup(expandedGroupId) {
    if (!onExpandedGroupIdsChange) return;
    const newExpandedGroupIds = new Set(expandedGroupIds);

    if (newExpandedGroupIds.has(expandedGroupId)) {
      newExpandedGroupIds.delete(expandedGroupId);
    } else {
      newExpandedGroupIds.add(expandedGroupId);
    }

    onExpandedGroupIdsChange(newExpandedGroupIds);
  }

  function handleKeyDown(event) {
    const {
      key,
      keyCode
    } = event;
    const row = rows[selectedPosition.rowIdx];

    if (onPaste && isCtrlKeyHeldDown(event) && isCellWithinBounds(selectedPosition) && !isGroupRow(row) && selectedPosition.idx !== -1 && selectedPosition.mode === 'SELECT') {
      const cKey = 67;
      const vKey = 86;

      if (keyCode === cKey) {
        handleCopy();
        return;
      }

      if (keyCode === vKey) {
        navigator.clipboard.readText().then(clipText => {
          handlePaste(clipText);
        });
        return;
      }
    }

    if (isCellWithinBounds(selectedPosition) && isGroupRow(row) && selectedPosition.idx === -1 && (key === 'ArrowLeft' && row.isExpanded || key === 'ArrowRight' && !row.isExpanded)) {
      event.preventDefault();
      toggleGroup(row.id);
      return;
    }

    switch (event.key) {
      case 'Escape':
        setCopiedCells(null);
        closeEditor();
        return;

      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Tab':
      case 'Home':
      case 'End':
      case 'PageUp':
      case 'PageDown':
        navigate(event);
        break;

      default:
        handleCellInput(event);
        break;
    }
  }

  function handleFocus() {
    isCellFocusable.current = true;
  }

  function handleScroll(event) {
    const {
      scrollTop,
      scrollLeft
    } = event.currentTarget;
    setScrollTop(scrollTop);
    setScrollLeft(scrollLeft);
    onScroll == null ? void 0 : onScroll(event);
  }

  function getRawRowIdx(rowIdx) {
    return hasGroups ? rawRows.indexOf(rows[rowIdx]) : rowIdx;
  }

  function commitEditorChanges() {
    var _columns$selectedPosi;

    if (((_columns$selectedPosi = columns[selectedPosition.idx]) == null ? void 0 : _columns$selectedPosi.editor) === undefined || selectedPosition.mode === 'SELECT' || isEqual(selectedPosition.row, selectedPosition.originalRow)) {
      return;
    }

    const updatedRows = [...rawRows];
    updatedRows[getRawRowIdx(selectedPosition.rowIdx)] = selectedPosition.row;
    onRowsChange == null ? void 0 : onRowsChange({
      newRows: updatedRows,
      position: selectedPosition.row,
      key: columns[selectedPosition.idx].key
    });
  }

  function handleCopy() {
    const {
      idx,
      rowIdx
    } = selectedPosition;
    if (idx === -1) return;
    const selectedCell = rawRows[rowIdx][columns[idx].key];

    if (typeof selectedCell === 'string' || !selectedCell.disabled) {
      var _latestDraggedOverRow;

      const overRowIdx = (_latestDraggedOverRow = latestDraggedOverRowIdx.current) != null ? _latestDraggedOverRow : rowIdx;
      const startRowIndex = rowIdx < overRowIdx ? rowIdx : overRowIdx;
      const endRowIndex = rowIdx < overRowIdx ? overRowIdx + 1 : rowIdx + 1;
      const targetRows = overRowIdx ? rawRows.slice(startRowIndex, endRowIndex) : rawRows.slice(rowIdx, rowIdx + 1);
      setCopiedCells({
        rows: targetRows,
        columnKey: columns[idx].key
      });

      if (navigator.clipboard) {
        const copiedValues = [];
        targetRows.forEach(r => {
          const cell = r[columns[idx].key];

          if (!cell.disabled) {
            copiedValues.push(cell.value);
          }
        });
        navigator.clipboard.writeText(copiedValues.join('\n'));
      }
    }
  }

  function handlePaste(text) {
    const {
      idx,
      rowIdx
    } = selectedPosition;
    if (idx === -1) return;
    const selectedCell = rawRows[rowIdx][columns[idx].key];
    const cellCanBePasted = !checkIfCellDisabled(selectedCell);

    if (!onPaste || !onRowsChange || text === '' || !isCellEditable(selectedPosition) || !cellCanBePasted) {
      return;
    }

    const copiedItems = text.split(/\n/).map(i => i.split(/[\t]/));
    const updatedTargetRows = [];
    const newRows = [...rawRows];
    const startRowIndex = rowIdx;
    const startColIndex = idx;
    const endColIndex = idx + copiedItems[0].length - 1;
    const endRowIndex = rowIdx + copiedItems.length - 1;

    for (let i = 0; i < copiedItems.length; i++) {
      for (let ix = 0; ix < copiedItems[i].length; ix++) {
        const row = newRows[startRowIndex + i];
        const colIdx = startColIndex + ix;

        if (row && columns[colIdx] && !checkIfCellDisabled(row[columns[colIdx].key]) && newRows[startRowIndex + i]) {
          const formatFunction = columns[colIdx].formatValue;
          newRows[startRowIndex + i] = { ...row,
            [columns[colIdx].key]: { ...row[columns[colIdx].key],
              value: formatFunction ? formatFunction({
                value: copiedItems[i][ix]
              }) : copiedItems[i][ix]
            }
          };
        }
      }

      updatedTargetRows.push(newRows[startRowIndex + i]);
    }

    const targetCols = columns.slice(startColIndex, endColIndex + 1);
    onRowsChange({
      newRows,
      updatedTargetRows,
      targetCols,
      key: columns[idx].key,
      type: 'paste'
    });
    setDraggedOverRowIdx(endRowIndex);
    setDraggedOverColumnIdx(endColIndex);
    setCopiedCells(null);
  }

  function handleCellInput(event) {
    var _column$editorOptions;

    if (!isCellWithinBounds(selectedPosition)) return;
    const row = rows[selectedPosition.rowIdx];
    if (isGroupRow(row)) return;
    const {
      key
    } = event;
    const column = columns[selectedPosition.idx];

    if (selectedPosition.mode === 'EDIT') {
      if (key === 'Enter') {
        commitEditorChanges();
        closeEditor();
      }

      return;
    }

    (_column$editorOptions = column.editorOptions) == null ? void 0 : _column$editorOptions.onCellKeyDown == null ? void 0 : _column$editorOptions.onCellKeyDown(event);
    if (event.isDefaultPrevented()) return;

    if (isCellEditable(selectedPosition) && isDefaultCellInput(event)) {
      setSelectedPosition(({
        idx,
        rowIdx
      }) => ({
        idx,
        rowIdx,
        key,
        mode: 'EDIT',
        row: { ...row,
          [column.key]: { ...row[column.key],
            value: ''
          }
        },
        originalRow: row
      }));
    }
  }

  function handleDragEnd() {
    const overRowIdx = latestDraggedOverRowIdx.current;
    const overColIdx = latestDraggedOverColIdx.current;
    const firstColIdx = firstSelectedColIdx.current;
    if (overRowIdx === undefined || overColIdx < 0 || !onFill || !onRowsChange) return;
    const {
      idx,
      rowIdx
    } = selectedPosition;
    const sourceRow = rawRows[rowIdx];

    if (overColIdx !== firstColIdx) {
      const startRowIndex = rowIdx < overRowIdx ? rowIdx : overRowIdx;
      const endRowIndex = rowIdx < overRowIdx ? overRowIdx + 1 : rowIdx + 1;
      const targetRows = rawRows.slice(startRowIndex, startRowIndex === endRowIndex ? endRowIndex + 1 : endRowIndex);
      const targetCols = columns.filter((column, i) => i > firstColIdx && i <= overColIdx);
      const updatedTargetRows = onFill({
        columnKey: columns[idx].key,
        targetCols,
        sourceRow,
        targetRows,
        across: true
      });
      const updatedRows = [...rawRows];

      for (let i = startRowIndex; i < endRowIndex; i++) {
        updatedRows[i] = updatedTargetRows[i - startRowIndex];
      }

      onRowsChange({
        newRows: updatedRows,
        updatedTargetRows,
        targetCols,
        targetRows,
        type: 'fill'
      });
    } else {
      const startRowIndex = rowIdx < overRowIdx ? rowIdx + 1 : overRowIdx;
      const endRowIndex = rowIdx < overRowIdx ? overRowIdx + 1 : rowIdx;
      const targetRows = rawRows.slice(startRowIndex, endRowIndex);
      const updatedTargetRows = onFill({
        columnKey: columns[idx].key,
        sourceRow,
        targetRows,
        across: false
      });
      const updatedRows = [...rawRows];

      for (let i = startRowIndex; i < endRowIndex; i++) {
        updatedRows[i] = updatedTargetRows[i - startRowIndex];
      }

      onRowsChange({
        newRows: updatedRows,
        updatedTargetRows,
        targetRows,
        key: columns[idx].key,
        type: 'fill'
      });
    }

    setCopiedCells(null);
  }

  function handleMouseDown(event) {
    if (event.buttons !== 1) return;
    setDragging(true);
    setFilling(true);
    setSelectedCells(draggedOverRowIdx != null ? draggedOverRowIdx : selectedPosition.rowIdx);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseup', onMouseUp);

    function onMouseOver(event) {
      if (event.buttons !== 1) onMouseUp();
    }

    function onMouseUp() {
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseup', onMouseUp);
      setDragging(false);
      setFilling(false);
      setSelectedCells(undefined);
      handleDragEnd();
    }
  }

  function handleCellMouseDown(event) {
    event.stopPropagation();
    if (event.buttons !== 1) return;
    setDragging(true);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseup', onMouseUp);

    function onMouseOver(event) {
      event.stopPropagation();
      if (event.buttons !== 1) onMouseUp();
    }

    function onMouseUp() {
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseup', onMouseUp);
      setDragging(false);
    }
  }

  function handleDoubleClick(event) {
    event.stopPropagation();
    if (!onFill || !onRowsChange) return;
    const {
      idx,
      rowIdx
    } = selectedPosition;
    const sourceRow = rawRows[rowIdx];
    const targetRows = rawRows.slice(rowIdx + 1);
    const updatedTargetRows = onFill({
      columnKey: columns[idx].key,
      sourceRow,
      targetRows,
      across: false
    });
    const updatedRows = [...rawRows];

    for (let i = rowIdx + 1; i < updatedRows.length; i++) {
      updatedRows[i] = updatedTargetRows[i - rowIdx - 1];
    }

    onRowsChange({
      newRows: updatedRows
    });
  }

  function handleFormatterRowChange(rowIdx, row) {
    const newRows = [...rawRows];
    newRows[rowIdx] = row;
    onRowsChange == null ? void 0 : onRowsChange({
      newRows
    });
  }

  function handleEditorRowChange(row, commitChanges) {
    if (selectedPosition.mode === 'SELECT') return;

    if (commitChanges) {
      const updatedRows = [...rawRows];
      updatedRows[getRawRowIdx(selectedPosition.rowIdx)] = row;
      onRowsChange == null ? void 0 : onRowsChange({
        newRows: updatedRows
      });
      closeEditor();
    } else {
      setSelectedPosition(position => ({ ...position,
        row
      }));
    }
  }

  function handleOnClose(commitChanges) {
    if (commitChanges) {
      commitEditorChanges();
    }

    closeEditor();
  }

  function isCellWithinBounds({
    idx,
    rowIdx
  }) {
    return rowIdx >= 0 && rowIdx < rows.length && idx >= minColIdx && idx < columns.length;
  }

  function isCellEditable(position) {
    return isCellWithinBounds(position) && isSelectedCellEditable({
      columns,
      rows,
      selectedPosition: position,
      isGroupRow
    });
  }

  function selectCell(position, enableEditor = false) {
    if (!isCellWithinBounds(position)) return;
    commitEditorChanges();
    setDraggedOverRowIdx(undefined);
    setOverColIdx(undefined);

    if (enableEditor && isCellEditable(position)) {
      const row = rows[position.rowIdx];
      setSelectedPosition({ ...position,
        mode: 'EDIT',
        key: null,
        row,
        originalRow: row
      });
    } else {
      setSelectedPosition({ ...position,
        mode: 'SELECT'
      });
      firstSelectedColIdx.current = position.idx;
    }

    onSelectedCellChange == null ? void 0 : onSelectedCellChange({ ...position
    });
  }

  function closeEditor() {
    if (selectedPosition.mode === 'SELECT') return;
    setSelectedPosition(({
      idx,
      rowIdx
    }) => ({
      idx,
      rowIdx,
      mode: 'SELECT'
    }));
  }

  function scrollToCell({
    idx,
    rowIdx
  }) {
    const {
      current
    } = gridRef;
    if (!current) return;

    if (typeof idx === 'number' && idx > lastFrozenColumnIndex) {
      const {
        clientWidth
      } = current;
      const {
        left,
        width
      } = columns[idx];
      const isCellAtLeftBoundary = left < scrollLeft + width + totalFrozenColumnWidth;
      const isCellAtRightBoundary = left + width > clientWidth + scrollLeft;

      if (isCellAtLeftBoundary || isCellAtRightBoundary) {
        const newScrollLeft = getColumnScrollPosition(columns, idx, scrollLeft, clientWidth);
        current.scrollLeft = scrollLeft + newScrollLeft;
      }
    }

    if (typeof rowIdx === 'number') {
      if (rowIdx * rowHeight < scrollTop) {
        current.scrollTop = rowIdx * rowHeight;
      } else if ((rowIdx + 1) * rowHeight > scrollTop + clientHeight) {
        current.scrollTop = (rowIdx + 1) * rowHeight - clientHeight;
      }
    }
  }

  function getNextPosition(key, ctrlKey, shiftKey) {
    const {
      idx,
      rowIdx
    } = selectedPosition;
    const row = rows[rowIdx];
    const isRowSelected = isCellWithinBounds(selectedPosition) && idx === -1;

    if (key === 'ArrowLeft' && isRowSelected && isGroupRow(row) && !row.isExpanded && row.level !== 0) {
      let parentRowIdx = -1;

      for (let i = selectedPosition.rowIdx - 1; i >= 0; i--) {
        const parentRow = rows[i];

        if (isGroupRow(parentRow) && parentRow.id === row.parentId) {
          parentRowIdx = i;
          break;
        }
      }

      if (parentRowIdx !== -1) {
        return {
          idx,
          rowIdx: parentRowIdx
        };
      }
    }

    const prevCol = columns[idx - 1];
    const nextCol = columns[idx + 1];

    switch (key) {
      case 'ArrowUp':
        return {
          idx,
          rowIdx: rowIdx - 1
        };

      case 'ArrowDown':
        return {
          idx,
          rowIdx: rowIdx + 1
        };

      case 'ArrowLeft':
        return prevCol != null && prevCol.editable ? {
          idx: idx - 1,
          rowIdx
        } : {
          idx,
          rowIdx
        };

      case 'ArrowRight':
        return nextCol != null && nextCol.editable ? {
          idx: idx + 1,
          rowIdx
        } : {
          idx,
          rowIdx
        };

      case 'Tab':
        if (selectedPosition.idx === -1 && selectedPosition.rowIdx === -1) {
          return shiftKey ? {
            idx: columns.length - 1,
            rowIdx: rows.length - 1
          } : {
            idx: 0,
            rowIdx: 0
          };
        }

        return {
          idx: idx + (shiftKey ? -1 : 1),
          rowIdx
        };

      case 'Home':
        if (isRowSelected) return {
          idx,
          rowIdx: 0
        };
        return ctrlKey ? {
          idx: 0,
          rowIdx: 0
        } : {
          idx: 0,
          rowIdx
        };

      case 'End':
        if (isRowSelected) return {
          idx,
          rowIdx: rows.length - 1
        };
        return ctrlKey ? {
          idx: columns.length - 1,
          rowIdx: rows.length - 1
        } : {
          idx: columns.length - 1,
          rowIdx
        };

      case 'PageUp':
        return {
          idx,
          rowIdx: rowIdx - Math.floor(clientHeight / rowHeight)
        };

      case 'PageDown':
        return {
          idx,
          rowIdx: rowIdx + Math.floor(clientHeight / rowHeight)
        };

      default:
        return selectedPosition;
    }
  }

  function navigate(event) {
    if (selectedPosition.mode === 'EDIT') {
      var _columns$selectedPosi2, _columns$selectedPosi3;

      const onNavigation = (_columns$selectedPosi2 = (_columns$selectedPosi3 = columns[selectedPosition.idx].editorOptions) == null ? void 0 : _columns$selectedPosi3.onNavigation) != null ? _columns$selectedPosi2 : onEditorNavigation;
      if (!onNavigation(event)) return;
    }

    const {
      key,
      shiftKey
    } = event;
    const ctrlKey = isCtrlKeyHeldDown(event);
    let nextPosition = getNextPosition(key, ctrlKey, shiftKey);
    let mode = cellNavigationMode;

    if (key === 'Tab') {
      if (canExitGrid({
        shiftKey,
        cellNavigationMode,
        columns,
        rowsCount: rows.length,
        selectedPosition
      })) {
        commitEditorChanges();
        return;
      }

      mode = cellNavigationMode === 'NONE' ? 'CHANGE_ROW' : cellNavigationMode;
    }

    event.preventDefault();
    nextPosition = getNextSelectedCellPosition({
      columns,
      rowsCount: rows.length,
      cellNavigationMode: mode,
      nextPosition
    });
    selectCell(nextPosition);
  }

  function getDraggedOverCellIdx(currentRowIdx, colIdx) {
    const {
      rowIdx
    } = selectedPosition;
    if (draggedOverRowIdx === undefined) return;
    if (draggedOverColumnIdx === undefined) return;
    if (!draggedOverColumnIdx.some(i => i === colIdx)) return;
    if (rowIdx < draggedOverRowIdx && (currentRowIdx < rowIdx || currentRowIdx > draggedOverRowIdx)) return;
    if (rowIdx > draggedOverRowIdx && (currentRowIdx > rowIdx || currentRowIdx < draggedOverRowIdx)) return;
    let isDraggedOver = false;

    if (rowIdx === draggedOverRowIdx && currentRowIdx === rowIdx) {
      isDraggedOver = draggedOverColumnIdx.some(i => i === colIdx);
    } else {
      isDraggedOver = rowIdx <= draggedOverRowIdx ? rowIdx <= currentRowIdx && currentRowIdx <= draggedOverRowIdx && draggedOverColumnIdx.some(i => i === colIdx) : rowIdx >= currentRowIdx && currentRowIdx >= draggedOverRowIdx && draggedOverColumnIdx.some(i => i === colIdx);
    }

    return isDraggedOver ? colIdx : undefined;
  }

  function getSelectedCellProps(rowIdx) {
    if (selectedPosition.rowIdx !== rowIdx) return;

    if (selectedPosition.mode === 'EDIT') {
      return {
        mode: 'EDIT',
        idx: selectedPosition.idx,
        onKeyDown: handleKeyDown,
        editorProps: {
          editorPortalTarget,
          rowHeight,
          row: selectedPosition.row,
          onRowChange: handleEditorRowChange,
          onClose: handleOnClose
        }
      };
    }

    return {
      mode: 'SELECT',
      idx: selectedPosition.idx,
      onFocus: handleFocus,
      onKeyDown: handleKeyDown,
      dragHandleProps: enableCellDragAndDrop && isCellEditable(selectedPosition) ? {
        onMouseDown: handleMouseDown,
        onDoubleClick: handleDoubleClick
      } : undefined
    };
  }

  function getCopiedCellIdx(row) {
    if (copiedCells === null) return undefined;
    if (typeof rowKeyGetter !== 'function') return undefined;
    const key = rowKeyGetter(row);

    if (copiedCells.rows.some(r => rowKeyGetter(r) === key)) {
      return columns.findIndex(c => c.key === copiedCells.columnKey);
    }

    return undefined;
  }

  function hasFirstCopiedCell(row) {
    if (copiedCells === null) return false;
    if (typeof rowKeyGetter !== 'function') return false;
    const key = rowKeyGetter(row);
    return rowKeyGetter(copiedCells.rows[0]) === key;
  }

  function hasLastCopiedCell(row) {
    if (copiedCells === null) return false;
    if (typeof rowKeyGetter !== 'function') return false;
    const key = rowKeyGetter(row);
    return rowKeyGetter(copiedCells.rows[copiedCells.rows.length - 1]) === key;
  }

  function getViewportRows() {
    const rowElements = [];
    let startRowIndex = 0;

    for (let rowIdx = rowOverscanStartIdx; rowIdx <= rowOverscanEndIdx; rowIdx++) {
      const row = rows[rowIdx];
      const top = rowIdx * rowHeight + totalHeaderHeight;

      if (isGroupRow(row)) {
        ({
          startRowIndex
        } = row);
        rowElements.push( /*#__PURE__*/React.createElement(GroupRowRenderer, {
          "aria-level": row.level + 1,
          "aria-setsize": row.setSize,
          "aria-posinset": row.posInSet + 1,
          "aria-rowindex": headerRowsCount + startRowIndex + 1,
          key: row.id,
          id: row.id,
          groupKey: row.groupKey,
          viewportColumns: viewportColumns,
          childRows: row.childRows,
          rowIdx: rowIdx,
          top: top,
          level: row.level,
          isExpanded: row.isExpanded,
          selectedCellIdx: selectedPosition.rowIdx === rowIdx ? selectedPosition.idx : undefined,
          isRowSelected: isSelectable && row.childRows.every(cr => selectedRows == null ? void 0 : selectedRows.has(rowKeyGetter(cr))),
          onFocus: selectedPosition.rowIdx === rowIdx ? handleFocus : undefined,
          onKeyDown: selectedPosition.rowIdx === rowIdx ? handleKeyDown : undefined,
          selectCell: selectCellWrapper,
          selectRow: selectRowWrapper,
          toggleGroup: toggleGroupWrapper
        }));
        continue;
      }

      startRowIndex++;
      let key = hasGroups ? startRowIndex : rowIdx;
      let isRowSelected = false;

      if (typeof rowKeyGetter === 'function') {
        var _selectedRows$has;

        key = rowKeyGetter(row);
        isRowSelected = (_selectedRows$has = selectedRows == null ? void 0 : selectedRows.has(key)) != null ? _selectedRows$has : false;
      }

      rowElements.push( /*#__PURE__*/React.createElement(RowRenderer, {
        "aria-rowindex": headerRowsCount + (hasGroups ? startRowIndex : rowIdx) + 1,
        "aria-selected": isSelectable ? isRowSelected : undefined,
        key: key,
        rowIdx: rowIdx,
        row: row,
        viewportColumns: viewportColumns,
        gridWidth: gridWidth,
        isRowSelected: isRowSelected,
        onRowClick: onRowClick,
        rowClass: rowClass,
        top: top,
        copiedCellIdx: copiedCells !== null ? getCopiedCellIdx(row) : undefined,
        hasFirstCopiedCell: copiedCells !== null && hasFirstCopiedCell(row),
        hasLastCopiedCell: copiedCells !== null && hasLastCopiedCell(row),
        getDraggedOverCellIdx: getDraggedOverCellIdx,
        setDraggedOverRowIdx: isDragging ? setDraggedOverRowIdx : undefined,
        setDraggedOverColumnIdx: isDragging ? setDraggedOverColumnIdx : undefined,
        selectedCellProps: getSelectedCellProps(rowIdx),
        onRowChange: handleFormatterRowChangeWrapper,
        selectCell: selectCellWrapper,
        selectRow: selectRowWrapper,
        handleCellMouseDown: handleCellMouseDown,
        selectedPosition: selectedPosition,
        bottomRowIdx: draggedOverRowIdx && draggedOverRowIdx > selectedPosition.rowIdx ? draggedOverRowIdx : selectedPosition.rowIdx,
        dragHandleProps: {
          onMouseDown: handleMouseDown,
          onDoubleClick: handleDoubleClick
        },
        isFilling: isFilling,
        isMultipleRows: selectedPosition.rowIdx !== draggedOverRowIdx,
        selectedCellsInfo: selectedCellsInfo,
        draggedOverRowIdx: draggedOverRowIdx,
        draggedOverColumnIdx: draggedOverColumnIdx,
        scrollLeft: scrollLeft,
        scrolledToEnd: gridRef.current ? gridRef.current.clientWidth + scrollLeft >= totalColumnWidth : false,
        expandRow: expandRow,
        enableOptionsCol: enableOptionsCol,
        optionsCol: columns[columns.length - 1]
      }));
    }

    return rowElements;
  }

  if (selectedPosition.idx >= columns.length || selectedPosition.rowIdx >= rows.length) {
    setSelectedPosition({
      idx: -1,
      rowIdx: -1,
      mode: 'SELECT'
    });
    setDraggedOverRowIdx(undefined);
  }

  if (selectedPosition.mode === 'EDIT' && rows[selectedPosition.rowIdx] !== selectedPosition.originalRow) {
    closeEditor();
  }

  const scrolledToEnd = gridRef.current ? gridRef.current.clientWidth + scrollLeft >= totalColumnWidth : false;
  return /*#__PURE__*/React.createElement("div", {
    id: "sheet-id",
    role: hasGroups ? 'treegrid' : 'grid',
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-multiselectable": isSelectable ? true : undefined,
    "aria-colcount": columns.length,
    "aria-rowcount": headerRowsCount + rowsCount + summaryRowsCount,
    className: clsx('rdg', className, isDragging && 'rdg-viewport-dragging'),
    style: { ...style,
      '--header-row-height': `${headerRowHeight}px`,
      '--filter-row-height': `${headerFiltersHeight}px`,
      '--row-width': `${totalColumnWidth}px`,
      '--row-height': `${rowHeight}px`
    },
    ref: gridRef,
    onScroll: handleScroll
  }, /*#__PURE__*/React.createElement(HeaderRow$1, {
    rowKeyGetter: rowKeyGetter,
    rows: rawRows,
    columns: viewportColumns,
    onColumnResize: handleColumnResize,
    allRowsSelected: (selectedRows == null ? void 0 : selectedRows.size) === rawRows.length,
    onSelectedRowsChange: onSelectedRowsChange,
    sortColumn: sortColumn,
    sortDirection: sortDirection,
    onSort: onSort,
    gridWidth: gridWidth,
    scrollLeft: scrollLeft,
    scrolledToEnd: scrolledToEnd,
    enableOptionsCol: enableOptionsCol,
    optionsCol: columns[columns.length - 1]
  }), enableFilterRow && /*#__PURE__*/React.createElement(FilterRow$1, {
    columns: viewportColumns,
    filters: filters,
    onFiltersChange: onFiltersChange
  }), rows.length === 0 && EmptyRowsRenderer ? /*#__PURE__*/React.createElement(EmptyRowsRenderer, null) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    ref: focusSinkRef,
    tabIndex: 0,
    className: "rdg-focus-sink",
    onKeyDown: handleKeyDown
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: Math.max(rows.length * rowHeight, clientHeight),
      position: 'sticky',
      left: 0
    }
  }, enableOptionsCol && /*#__PURE__*/React.createElement("div", {
    className: "rdg-mock-options",
    style: {
      boxShadow: scrolledToEnd ? 'none' : '-1px 0px 6px 2px rgba(0, 0, 0, 0.12)',
      width: scrolledToEnd ? 55 : 54,
      borderLeft: scrolledToEnd ? '1px solid #edeef0' : 'none'
    }
  })), getViewportRows(), summaryRows == null ? void 0 : summaryRows.map((row, rowIdx) => /*#__PURE__*/React.createElement(SummaryRow$1, {
    "aria-rowindex": headerRowsCount + rowsCount + rowIdx + 1,
    key: rowIdx,
    rowIdx: rowIdx,
    row: row,
    bottom: rowHeight * (summaryRows.length - 1 - rowIdx),
    viewportColumns: viewportColumns
  }))));
}

const DataGrid$1 = /*#__PURE__*/React.forwardRef(DataGrid);

function autoFocusAndSelect(input) {
  input == null ? void 0 : input.focus();
}

function TextEditor({
  row,
  column,
  onRowChange,
  onClose
}) {
  const cell = row[column.key];
  return typeof cell === 'string' ? /*#__PURE__*/React.createElement("input", {
    className: column.alignment === 'right' ? 'rdg-text-editor-right' : 'rdg-text-editor',
    ref: autoFocusAndSelect,
    value: cell,
    onChange: event => onRowChange({ ...row,
      [column.key]: event.target.value
    }),
    onBlur: () => onClose(true)
  }) : /*#__PURE__*/React.createElement("input", {
    className: column.alignment === 'right' ? 'rdg-text-editor-right' : 'rdg-text-editor',
    ref: autoFocusAndSelect,
    value: cell.value,
    onChange: event => onRowChange({ ...row,
      [column.key]: { ...cell,
        value: event.target.value
      }
    }),
    onBlur: () => onClose(true)
  });
}

exports.Cell = Cell$1;
exports.Row = Row$1;
exports.SELECT_COLUMN_KEY = SELECT_COLUMN_KEY;
exports.SelectCellFormatter = SelectCellFormatter;
exports.SelectColumn = SelectColumn;
exports.SortableHeaderCell = SortableHeaderCell;
exports.TextEditor = TextEditor;
exports.ToggleGroupFormatter = ToggleGroupFormatter;
exports.ValueFormatter = ValueFormatter;
exports.default = DataGrid$1;
//# sourceMappingURL=bundle.cjs.map
