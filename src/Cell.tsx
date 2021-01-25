import React, { forwardRef, memo, useRef } from 'react';
import clsx from 'clsx';

import type { CellRendererProps } from './types';
import { wrapEvent, checkIfCellDisabled } from './utils';
import { useCombinedRefs } from './hooks';

function Cell<R, SR>({
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
  scrollLeft
}: CellRendererProps<R, SR>, ref: React.Ref<HTMLDivElement>) {
  const cellRef = useRef<HTMLDivElement>(null);
  const disabled = checkIfCellDisabled(cell);
  const error = typeof cell === 'object' && cell.error;
  const frozen = column.frozen;
  const frozenRightAlign = column.frozenAlignment && column.frozenAlignment === 'right';

  const { cellClass } = column;
  className = clsx(
    'rdg-cell',
    {
      'rdg-cell-frozen': column.frozen,
      'rdg-cell-frozen-align-right': frozenRightAlign,
      'rdg-cell-frozen-align-right-no-shadow': scrolledToEnd && frozenRightAlign,
      'rdg-cell-frozen-last': column.isLastFrozenColumn && scrollLeft > 0,
      'rdg-cell-selected': isCellSelected,
      'rdg-cell-copied': isCopied && !disabled,
      'rdg-cell-dragged-over': checkIsDraggedOver(),
      'rdg-cell-align-right': column.alignment === 'right',
      'rdg-cell-disabled': disabled,
      'rdg-cell-error': error
    },
    typeof cellClass === 'function' ? cellClass(row) : cellClass,
    className
  );

  function checkIsDraggedOver() {
      if (disabled || frozen) {
          return false;
      }

      if (selectedCellsInfo === selectedPosition.rowIdx && isFilling) {
          return false;
      }

      if (selectedCellsInfo !== selectedPosition.rowIdx && column.idx !== draggedOverColumnIdx?.[0] && isFilling) {
          return false;
      }

      return isDraggedOver;
  }

  function selectCellWrapper(openEditor?: boolean) {
    if (!dragHandleProps) {
        selectCell({ idx: column.idx, rowIdx }, openEditor);
    }

    if (dragHandleProps && openEditor) {
        selectCell({ idx: column.idx, rowIdx }, openEditor);
    }
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
      event.preventDefault();
      if (event.buttons === 2) return;
      if (disabled || frozen || frozenRightAlign) return;
      selectCellWrapper(false);
      handleCellMouseDown(event);
  }

  function handleMouseEnter(event: React.MouseEvent<HTMLDivElement>) {
      if (event.buttons === 1) {
        handleDragEnter(column.idx);
      }
  }

  function handleDoubleClick() {
      if (!disabled && !frozen && !frozenRightAlign) {
          selectCellWrapper(true);
      }
  }

  function handleRowChange(newRow: R) {
    onRowChange(rowIdx, newRow);
  }

  function onRowSelectionChange(checked: boolean, isShiftClick: boolean) {
    selectRow({ rowIdx, checked, isShiftClick });
  }

  function checkForTopActiveBorder(): boolean {
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

  function checkForBottomActiveBorder(): boolean {
      if (isFilling && rowIdx === bottomRowIdx && !checkIsDraggedOver() && isDraggedOver) {
          return true;
      }

      if (isCopied && hasLastCopiedCell) {
          return true;
      }

      return false;
  }

  function checkForRightActiveBorder(): boolean {
      if (
          isFilling &&
          draggedOverColumnIdx &&
          draggedOverColumnIdx[draggedOverColumnIdx.length - 1] === column.idx &&
          isDraggedOver &&
          !checkIsDraggedOver()
      ) {
          return true;
      }

      if (isCopied) {
          return true;
      }

      return false;
  }

  function checkForLeftActiveBorder(): boolean {
      if (isFilling && draggedOverColumnIdx && draggedOverColumnIdx[0] === column.idx && isDraggedOver && !checkIsDraggedOver()) {
          return true;
      }

      if (isCopied) {
          return true;
      }

      return false;
  }

  return (
    <div
      role="gridcell"
      aria-colindex={column.idx + 1} // aria-colindex is 1-based
      aria-selected={isCellSelected}
      ref={useCombinedRefs(cellRef, ref)}
      className={className}
      style={column.frozenAlignment === 'right' ? { width: column.width, left: gridWidth - column.width } : {
        width: column.width,
        left: column.left
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onDoubleClick={wrapEvent(handleDoubleClick, onDoubleClick)}
    >
      {!column.rowGroup && (
        <>
          <div className={clsx(
            'rdg-cell-fake-background',
            {
              'rdg-cell-fake-background-active-top': checkForTopActiveBorder(),
              'rdg-cell-fake-background-active-bottom': checkForBottomActiveBorder(),
              'rdg-cell-fake-background-active-right': checkForRightActiveBorder(),
              'rdg-cell-fake-background-active-left': checkForLeftActiveBorder()
          })} />
          <column.formatter
            rowIdx={rowIdx}
            cell={cell}
            isCellSelected={isCellSelected}
            isRowSelected={isRowSelected}
            onRowSelectionChange={onRowSelectionChange}
            onRowChange={handleRowChange}
          />
          {dragHandleProps && !disabled && !frozenRightAlign && !frozen && (
            <div className="rdg-cell-drag-handle" {...dragHandleProps} />
          )}
        </>
      )}
    </div>
  );
}

export default memo(forwardRef(Cell)) as <R, SR = unknown>(props: CellRendererProps<R, SR> & React.RefAttributes<HTMLDivElement>) => JSX.Element;
