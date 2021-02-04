// import faker from 'faker';
import React, { useState, useRef } from 'react';
import DataGrid, { TextEditor } from '../../src';
import type { Column, DataGridHandle, FillEvent, PasteEvent } from '../../src';

import './AllFeatures.less';

export interface Row {
    id: string,
    name: string,
    '2021-01-01': {value: string, disabled?: boolean, error?: boolean},
    '2021-02-01': {value: string, disabled?: boolean, error?: boolean},
    '2021-03-01': {value: string, disabled?: boolean, error?: boolean},
    '2021-04-01': {value: string, disabled?: boolean, error?: boolean},
    '2021-05-01': {value: string, disabled?: boolean, error?: boolean},
    '2021-06-01': {value: string, disabled?: boolean, error?: boolean},
    '2021-07-01': {value: string, disabled?: boolean, error?: boolean},
    '2021-08-01': {value: string, disabled?: boolean, error?: boolean},
    '2021-09-01': {value: string, disabled?: boolean, error?: boolean},
    '2021-10-01': {value: string, disabled?: boolean, error?: boolean},
    '2021-11-01': {value: string, disabled?: boolean, error?: boolean},
    '2021-12-01': {value: string, disabled?: boolean, error?: boolean},
    '2022-01-01': {value: string, disabled?: boolean, error?: boolean}
}

export interface TSummaryRow {}

function rowKeyGetter(row: Row) {
  return row.id;
}

const columns: readonly Column<Row>[] = [
    {key: "name", name: "Name", width: 285, frozen: true },
    {key: "options", name: "", frozenAlignment: "right", width: 54, frozen: true},
    {key: "2021-01-01", name: "Jan 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2021-02-01", name: "Feb 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2021-03-01", name: "Mar 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2021-04-01", name: "Apr 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2021-05-01", name: "May 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2021-06-01", name: "Jun 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2021-07-01", name: "Jul 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2021-08-01", name: "Aug 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2021-09-01", name: "Sep 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2021-10-01", name: "Oct 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2021-11-01", name: "Nov 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2021-12-01", name: "Dec 2021", width: 116, alignment: "right", editor: TextEditor},
    {key: "2022-01-01", name: "Jan 2022", width: 116, alignment: "right", editor: TextEditor}
];

function createRows(): Row[] {
  return [
    {
        name: "Search and Book",
        id: "20613843566739542",
        '2021-01-01': {
            value: "--",
            disabled: true
        },
        '2021-02-01': {
            value: "--",
            disabled: true
        },
        '2021-03-01': {
            value: "--",
            disabled: true
        },
        '2021-04-01': {
            value: "--",
            disabled: true
        },
        '2021-05-01': {
            value: "--",
            disabled: true
        },
        '2021-06-01': {
            value: "--",
            disabled: true
        },
        '2021-07-01': {
            value: "$0",
            disabled: false
        },
        '2021-08-01': {
            value: "$0",
            disabled: false
        },
        '2021-09-01': {
            value: "$0",
            disabled: false
        },
        '2021-10-01': {
            value: "$0",
            disabled: false
        },
        '2021-11-01': {
            value: "$0",
            disabled: false
        },
        '2021-12-01': {
            value: "$0",
            disabled: false
        },
        '2022-01-01': {
            value: "--",
            disabled: true
        }
    },
    {
        name: "Sales",
        id: "25338270430806944",
        '2021-01-01': {
            value: "$10,000",
            disabled: false
        },
        '2021-02-01': {
            value: "$10,000",
            disabled: false
        },
        '2021-03-01': {
            value: "$10,000",
            disabled: false
        },
        '2021-04-01': {
            value: "$10,000",
            disabled: false
        },
        '2021-05-01': {
            value: "$10,000",
            disabled: false
        },
        '2021-06-01': {
            value: "$10,000",
            disabled: false
        },
        '2021-07-01': {
            value: "$10,000",
            disabled: false
        },
        '2021-08-01': {
            value: "--",
            disabled: true
        },
        '2021-09-01': {
            value: "--",
            disabled: true
        },
        '2021-10-01': {
            value: "--",
            disabled: true
        },
        '2021-11-01': {
            value: "--",
            disabled: true
        },
        '2021-12-01': {
            value: "--",
            disabled: true
        },
        '2022-01-01': {
            value: "--",
            disabled: true
        }
    },
    {
        name: "Engineering",
        id: "26714847592858783",
        '2021-01-01': {
            value: "$200",
            disabled: false
        },
        '2021-02-01': {
            value: "$200",
            disabled: false
        },
        '2021-03-01': {
            value: "$200",
            disabled: false
        },
        '2021-04-01': {
            value: "$200",
            disabled: false
        },
        '2021-05-01': {
            value: "$200",
            disabled: false
        },
        '2021-06-01': {
            value: "$200",
            disabled: false
        },
        '2021-07-01': {
            value: "$200",
            disabled: false
        },
        '2021-08-01': {
            value: "--",
            disabled: true
        },
        '2021-09-01': {
            value: "--",
            disabled: true
        },
        '2021-10-01': {
            value: "--",
            disabled: true
        },
        '2021-11-01': {
            value: "--",
            disabled: true
        },
        '2021-12-01': {
            value: "--",
            disabled: true
        },
        '2022-01-01': {
            value: "--",
            disabled: true
        }
    },
    {
        name: "Engineering",
        id: "26715779865003183",
        '2021-01-01': {
            value: "$200",
            disabled: false
        },
        '2021-02-01': {
            value: "$200",
            disabled: false
        },
        '2021-03-01': {
            value: "$200",
            disabled: false
        },
        '2021-04-01': {
            value: "$200",
            disabled: false
        },
        '2021-05-01': {
            value: "$200",
            disabled: false
        },
        '2021-06-01': {
            value: "$200",
            disabled: false
        },
        '2021-07-01': {
            value: "$200",
            disabled: false
        },
        '2021-08-01': {
            value: "--",
            disabled: true
        },
        '2021-09-01': {
            value: "--",
            disabled: true
        },
        '2021-10-01': {
            value: "--",
            disabled: true
        },
        '2021-11-01': {
            value: "--",
            disabled: true
        },
        '2021-12-01': {
            value: "--",
            disabled: true
        },
        '2022-01-01': {
            value: "--",
            disabled: true
        }
    },
    {
        name: "Another Budget",
        id: "87641522069075013",
        '2021-01-01': {
            value: "$4000",
            disabled: false
        },
        '2021-02-01': {
            value: "--",
            disabled: true
        },
        '2021-03-01': {
            value: "--",
            disabled: true
        },
        '2021-04-01': {
            value: "--",
            disabled: true
        },
        '2021-05-01': {
            value: "--",
            disabled: true
        },
        '2021-06-01': {
            value: "--",
            disabled: true
        },
        '2021-07-01': {
            value: "--",
            disabled: true
        },
        '2021-08-01': {
            value: "--",
            disabled: true
        },
        '2021-09-01': {
            value: "--",
            disabled: true
        },
        '2021-10-01': {
            value: "--",
            disabled: true
        },
        '2021-11-01': {
            value: "--",
            disabled: true
        },
        '2021-12-01': {
            value: "--",
            disabled: true
        },
        '2022-01-01': {
            value: "--",
            disabled: true
        }
    },
    {
        name: "Fruit snacks",
        id: "52506902055117528",
        '2021-01-01': {
            value: "$1000",
            disabled: true
        },
        '2021-02-01': {
            value: "$1000",
            disabled: true
        },
        '2021-03-01': {
            value: "$1000",
            disabled: true
        },
        '2021-04-01': {
            value: "$1000",
            disabled: true
        },
        '2021-05-01': {
            value: "$1000",
            disabled: true
        },
        '2021-06-01': {
            value: "$1000",
            disabled: true
        },
        '2021-07-01': {
            value: "$1000",
            disabled: true
        },
        '2021-08-01': {
            value: "$1000",
            disabled: true
        },
        '2021-09-01': {
            value: "$1000",
            disabled: true
        },
        '2021-10-01': {
            value: "$1000",
            disabled: true
        },
        '2021-11-01': {
            value: "$1000",
            disabled: true
        },
        '2021-12-01': {
            value: "--",
            disabled: true
        },
        '2022-01-01': {
            value: "--",
            disabled: true
        }
    },
    {
        name: "Fresh fruits",
        id: "65227284566531957",
        '2021-01-01': {
            value: "$1000",
            disabled: false
        },
        '2021-02-01': {
            value: "$1000",
            disabled: false
        },
        '2021-03-01': {
            value: "$1000",
            disabled: false
        },
        '2021-04-01': {
            value: "$1000",
            disabled: false
        },
        '2021-05-01': {
            value: "$1000",
            disabled: false
        },
        '2021-06-01': {
            value: "$1000",
            disabled: false
        },
        '2021-07-01': {
            value: "$1000",
            disabled: false
        },
        '2021-08-01': {
            value: "$1000",
            disabled: false
        },
        '2021-09-01': {
            value: "$1000",
            disabled: false
        },
        '2021-10-01': {
            value: "$1000",
            disabled: false
        },
        '2021-11-01': {
            value: "$1000",
            disabled: false
        },
        '2021-12-01': {
            value: "--",
            disabled: true
        },
        '2022-01-01': {
            value: "--",
            disabled: true
        }
    },
    {
        name: "Lincoln Test 2",
        id: "68024968889257378",
        '2021-01-01': {
            value: "$3000",
            disabled: false
        },
        '2021-02-01': {
            value: "$3000",
            disabled: false
        },
        '2021-03-01': {
            value: "$3000",
            disabled: false
        },
        '2021-04-01': {
            value: "$3000",
            disabled: false
        },
        '2021-05-01': {
            value: "$3000",
            disabled: false
        },
        '2021-06-01': {
            value: "$3000",
            disabled: false
        },
        '2021-07-01': {
            value: "$3000",
            disabled: false
        },
        '2021-08-01': {
            value: "$3000",
            disabled: false
        },
        '2021-09-01': {
            value: "$3000",
            disabled: false
        },
        '2021-10-01': {
            value: "$3000",
            disabled: false
        },
        '2021-11-01': {
            value: "$3000",
            disabled: false
        },
        '2021-12-01': {
            value: "$3000",
            disabled: false
        },
        '2022-01-01': {
            value: "$3000",
            disabled: false
        }
    }
    // {
    //     name: "Lincoln test 2 (socks)",
    //     id: "68025365469089224",
    //     '2021-01-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-02-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-03-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-04-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-05-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-06-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-07-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-08-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-09-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-10-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-11-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-12-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2022-01-01': {
    //         value: "$3000",
    //         disabled: false
    //     }
    // },
    // {
    //     name: "Jake's Budget",
    //     id: "67783645384952106",
    //     '2021-01-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-02-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-03-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-04-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-05-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-06-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-07-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-08-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-09-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-10-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-11-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-12-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2022-01-01': {
    //         value: "$5",
    //         disabled: false
    //     }
    // },
    // {
    //     name: "Amanda's Budget",
    //     id: "68498530053932260",
    //     '2021-01-01': {
    //         value: "$2000",
    //         disabled: false
    //     },
    //     '2021-02-01': {
    //         value: "$2000",
    //         disabled: false
    //     },
    //     '2021-03-01': {
    //         value: "$2000",
    //         disabled: false
    //     },
    //     '2021-04-01': {
    //         value: "$2000",
    //         disabled: false
    //     },
    //     '2021-05-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-06-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-07-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-08-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-09-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-10-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-11-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-12-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2022-01-01': {
    //         value: "--",
    //         disabled: true
    //     }
    // }
  ];
}

export function LolaFeatures() {
  const [rows, setRows] = useState(() => createRows());
  const [selectedRows, setSelectedRows] = useState(() => new Set<React.Key>());
  const gridRef = useRef<DataGridHandle>(null);

  function handleFill({ columnKey, targetCols, sourceRow, targetRows, across }: FillEvent<Row, TSummaryRow>): Row[] {
      if (across) {
          return targetRows.map(row => {
              let newRow = row;
              targetCols.forEach(col => {
                  const cell = row[col.key];
                  if (typeof cell === 'string' || !cell.disabled) {
                      newRow = { ...newRow, [col.key]: row[columnKey] };
                  } else {
                      newRow = { ...newRow };
                  }
              });
              return newRow;
          });
      }
    return targetRows.map(row => {
        const cell = row[columnKey as keyof Row];
        if (typeof cell === 'string' || !cell.disabled) {
            return ({ ...row, [columnKey as keyof Row]: sourceRow[columnKey as keyof Row] })
        }

        return ({ ...row });
    });
  }

  function handlePaste({ sourceColumnKey, sourceRows, targetColumnKey, targetRows }: PasteEvent<Row>): Row[] {
    if (sourceRows.length === 1) {
        return [{ ...targetRows[0], [targetColumnKey]: sourceRows[0][sourceColumnKey as keyof Row] }];
    }

    let checkIndex = 0;

    return targetRows.map((row) => {
        const cell = row[targetColumnKey];
        if (typeof cell === 'string' || !cell.disabled) {
            const newRow = { ...row, [targetColumnKey]: sourceRows[checkIndex][sourceColumnKey as keyof Row] };
            checkIndex += 1;
            return newRow;

        }
        return { ...row };
    });
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
        onSelectedRowsChange={setSelectedRows}
        enableOptionsCol
      />
    </div>
  );
}

LolaFeatures.storyName = 'Lola Features';
