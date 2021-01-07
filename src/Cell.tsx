import { forwardRef, memo, useRef } from 'react';
import clsx from 'clsx';

import type { CellRendererProps } from './types';
import { wrapEvent } from './utils';
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
  onRowClick,
  onDoubleClick,
  onContextMenu,
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
  ...props
}: CellRendererProps<R, SR>, ref: React.Ref<HTMLDivElement>) {
  const cellRef = useRef<HTMLDivElement>(null);

  const { cellClass } = column;
  className = clsx(
    'rdg-cell',
    {
      'rdg-cell-frozen': column.frozen,
      'rdg-cell-frozen-last': column.isLastFrozenColumn,
      'rdg-cell-selected': isCellSelected,
      'rdg-cell-copied': isCopied,
      'rdg-cell-dragged-over': checkIsDraggedOver(),
      'rdg-cell-align-right': column.alignment === 'right'
    },
    typeof cellClass === 'function' ? cellClass(row) : cellClass,
    className
  );

  function checkIsDraggedOver() {
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

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    selectCellWrapper(column.editorOptions?.editOnClick);
    onRowClick?.(rowIdx, row, column);
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
      event.preventDefault();
      selectCellWrapper(false);
      handleCellMouseDown(event);
  }

  function handleMouseEnter(event: React.MouseEvent<HTMLDivElement>) {
      if (event.buttons === 1) {
        handleDragEnter(column.idx);
      }
  }

  function handleContextMenu() {
    selectCellWrapper();
  }

  function handleDoubleClick() {
    selectCellWrapper(true);
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

  return (
    <div
      role="gridcell"
      aria-colindex={column.idx + 1} // aria-colindex is 1-based
      aria-selected={isCellSelected}
      ref={useCombinedRefs(cellRef, ref)}
      className={className}
      style={{
        width: column.width,
        left: column.left
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onDoubleClick={wrapEvent(handleDoubleClick, onDoubleClick)}
      onContextMenu={wrapEvent(handleContextMenu, onContextMenu)}
      {...props}
    >
      {!column.rowGroup && (
        <>
          <div className={clsx(
            'rdg-cell-fake-background',
            {
              'rdg-cell-fake-background-active-top': checkForTopActiveBorder(),
              'rdg-cell-fake-background-active-bottom': checkForBottomActiveBorder(),
              'rdg-cell-fake-background-active-right': checkForRightActiveBorder(),
              'rdg-cell-fake-background-active-left': (isFilling && draggedOverColumnIdx && draggedOverColumnIdx[0] === column.idx && isDraggedOver && !checkIsDraggedOver()) || isCopied
          })} />
          <column.formatter
            column={column}
            rowIdx={rowIdx}
            row={row}
            isCellSelected={isCellSelected}
            isRowSelected={isRowSelected}
            onRowSelectionChange={onRowSelectionChange}
            onRowChange={handleRowChange}
          />
          {dragHandleProps && (
            <div className="rdg-cell-drag-handle" {...dragHandleProps} />
          )}
        </>
      )}
    </div>
  );
}

export default memo(forwardRef(Cell)) as <R, SR = unknown>(props: CellRendererProps<R, SR> & React.RefAttributes<HTMLDivElement>) => JSX.Element;
