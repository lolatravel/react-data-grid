import faker from 'faker';
import { useState, useRef } from 'react';
import DataGrid, { SelectColumn, TextEditor } from '../../src';
import type { Column, DataGridHandle, FillEvent, PasteEvent } from '../../src';
import DropDownEditor from './components/Editors/DropDownEditor';
import { ImageFormatter } from './components/Formatters';

import './AllFeatures.less';

export interface Row {
    id: string,
    name: string,
    'Jun 2020': string,
    'Jul 2020': string,
    'Aug 2020': string,
    'Sep 2020': string,
    'Oct 2020': string,
    'Nov 2020': string,
    'Dec 2020': string
}

function rowKeyGetter(row: Row) {
  return row.id;
}

faker.locale = 'en_GB';

const columns: readonly Column<Row>[] = [
    {
      key: 'name',
      name: 'Name',
      width: 285,
      frozen: true
    },
    {
      key: 'Jun 2020',
      name: 'Jun 2020',
      width: 116,
      editor: TextEditor
    },
    {
      key: 'Jul 2020',
      name: 'Jul 2020',
      width: 116,
      editor: TextEditor
    },
    {
      key: 'Aug 2020',
      name: 'Aug 2020',
      width: 116,
      editor: TextEditor
    },
    {
      key: 'Sep 2020',
      name: 'Sep 2020',
      width: 116,
      editor: TextEditor
    },
    {
      key: 'Oct 2020',
      name: 'Oct 2020',
      width: 116,
      editor: TextEditor
    },
    {
      key: 'Nov 2020',
      name: 'Nov 2020',
      width: 116,
      editor: TextEditor
    },
    {
      key: 'Dec 2020',
      name: 'Dec 2020',
      width: 116,
      editor: TextEditor
    }
];

function createFakeRowObjectData(index: number): Row {
  return  {
      id: `id_${index}`,
      name: `${faker.commerce.department()}`,
      'Jun 2020': `$${faker.commerce.price()}`,
      'Jul 2020': `$${faker.commerce.price()}`,
      'Aug 2020': `$${faker.commerce.price()}`,
      'Sep 2020': `$${faker.commerce.price()}`,
      'Oct 2020': `$${faker.commerce.price()}`,
      'Nov 2020': `$${faker.commerce.price()}`,
      'Dec 2020': `$${faker.commerce.price()}`
  }
}

function createRows(numberOfRows: number): Row[] {
  const rows: Row[] = [];

  for (let i = 0; i < numberOfRows; i++) {
    rows[i] = createFakeRowObjectData(i);
  }

  return rows;
}

function isAtBottom(event: React.UIEvent<HTMLDivElement>): boolean {
  const target = event.target as HTMLDivElement;
  return target.clientHeight + target.scrollTop === target.scrollHeight;
}

function loadMoreRows(newRowsCount: number, length: number): Promise<Row[]> {
  return new Promise(resolve => {
    const newRows: Row[] = [];

    for (let i = 0; i < newRowsCount; i++) {
      newRows[i] = createFakeRowObjectData(i + length);
    }

    setTimeout(() => resolve(newRows), 1000);
  });
}

export function LolaFeatures() {
  const [rows, setRows] = useState(() => createRows(2000));
  const [selectedRows, setSelectedRows] = useState(() => new Set<React.Key>());
  const [isLoading, setIsLoading] = useState(false);
  const gridRef = useRef<DataGridHandle>(null);

  function handleFill({ columnKey, sourceRow, targetRows }: FillEvent<Row>): Row[] {
    return targetRows.map(row => ({ ...row, [columnKey as keyof Row]: sourceRow[columnKey as keyof Row] }));
  }

  function handlePaste({ sourceColumnKey, sourceRow, targetColumnKey, targetRow }: PasteEvent<Row>): Row {
    const incompatibleColumns = ['email', 'zipCode', 'date'];
    if (
      sourceColumnKey === 'avatar'
      || ['id', 'avatar'].includes(targetColumnKey)
      || ((incompatibleColumns.includes(targetColumnKey) || incompatibleColumns.includes(sourceColumnKey)) && sourceColumnKey !== targetColumnKey)) {
      return targetRow;
    }

    return { ...targetRow, [targetColumnKey]: sourceRow[sourceColumnKey as keyof Row] };
  }

  async function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    if (!isAtBottom(event)) return;

    setIsLoading(true);

    const newRows = await loadMoreRows(50, rows.length);

    setRows([...rows, ...newRows]);
    setIsLoading(false);
  }

  return (
    <div className="all-features">
      <DataGrid
        ref={gridRef}
        columns={columns}
        rows={rows}
        rowKeyGetter={rowKeyGetter}
        onRowsChange={setRows}
        onFill={handleFill}
        onPaste={handlePaste}
        rowHeight={60}
        headerRowHeight={48}
        selectedRows={selectedRows}
        onScroll={handleScroll}
        onSelectedRowsChange={setSelectedRows}
      />
      {isLoading && <div className="load-more-rows-tag">Loading more rows...</div>}
    </div>
  );
}

LolaFeatures.storyName = 'Lola Features';