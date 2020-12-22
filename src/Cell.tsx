import { forwardRef, memo, useRef, useState } from 'react';
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
  onClick,
  onDoubleClick,
  onContextMenu,
  onRowChange,
  selectCell,
  handleCellMouseDown,
  selectedPosition,
  selectRow,
  handleDragEnter,
  ...props
}: CellRendererProps<R, SR>, ref: React.Ref<HTMLDivElement>) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [isLastDragged, setIsLastDragged] = useState(false);

  const { cellClass } = column;
  className = clsx(
    'rdg-cell',
    {
      'rdg-cell-frozen': column.frozen,
      'rdg-cell-frozen-last': column.isLastFrozenColumn,
      'rdg-cell-selected': isCellSelected,
      'rdg-cell-copied': isCopied,
      'rdg-cell-dragged-over': isDraggedOver
    },
    typeof cellClass === 'function' ? cellClass(row) : cellClass,
    className
  );

  function selectCellWrapper(openEditor?: boolean) {
    selectCell({ idx: column.idx, rowIdx }, openEditor);
  }

  function handleClick() {
    selectCellWrapper(column.editorOptions?.editOnClick);
    onRowClick?.(rowIdx, row, column);
  }

  function handleMouseDown(event) {
      selectCellWrapper(false);
      setIsLastDragged(false);
      handleCellMouseDown(event);
  }

  function handleMouseEnter(event) {
      if (event.buttons === 1) {
          console.log(column);
          handleDragEnter(column.idx);
          setIsLastDragged(true);
      }
  }

  function handleMouseLeave(event) {
      if (event.buttons === 1) {
          setIsLastDragged(false);
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
      onClick={wrapEvent(handleClick, onClick)}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={wrapEvent(handleDoubleClick, onDoubleClick)}
      onContextMenu={wrapEvent(handleContextMenu, onContextMenu)}
      {...props}
    >
      {!column.rowGroup && (
        <>
          <div
            className={clsx('rdg-cell-fake-background', {
              // 'rdg-cell-fake-background-active': isDraggedOver,
              // 'rdg-cell-fake-background-active-last': isLastDragged && isDraggedOver && selectedPosition.rowIdx < rowIdx,
              // 'rdg-cell-fake-background-active-first': isLastDragged && isDraggedOver && selectedPosition.rowIdx > rowIdx
            })}
          />
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
