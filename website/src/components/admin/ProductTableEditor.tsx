"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Table, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface ProductTable {
  title: string;
  headers: string[];
  rows: string[][];
}

interface ProductTableEditorProps {
  tables: ProductTable[];
  onChange: (tables: ProductTable[]) => void;
}

export function ProductTableEditor({ tables, onChange }: ProductTableEditorProps) {
  const [expandedTable, setExpandedTable] = useState<number | null>(tables.length > 0 ? 0 : null);

  // Add a new table
  const addTable = () => {
    const newTable: ProductTable = {
      title: "New Table",
      headers: ["Column 1", "Column 2", "Column 3"],
      rows: [["", "", ""]],
    };
    onChange([...tables, newTable]);
    setExpandedTable(tables.length);
  };

  // Remove a table
  const removeTable = (index: number) => {
    const updated = tables.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedTable === index) {
      setExpandedTable(null);
    } else if (expandedTable !== null && expandedTable > index) {
      setExpandedTable(expandedTable - 1);
    }
  };

  // Update table title
  const updateTitle = (index: number, title: string) => {
    const updated = [...tables];
    updated[index] = { ...updated[index], title };
    onChange(updated);
  };

  // Add a column
  const addColumn = (tableIndex: number) => {
    const updated = [...tables];
    const table = updated[tableIndex];
    table.headers = [...table.headers, `Column ${table.headers.length + 1}`];
    table.rows = table.rows.map(row => [...row, ""]);
    onChange(updated);
  };

  // Remove a column
  const removeColumn = (tableIndex: number, colIndex: number) => {
    const updated = [...tables];
    const table = updated[tableIndex];
    if (table.headers.length <= 1) return; // Keep at least 1 column
    table.headers = table.headers.filter((_, i) => i !== colIndex);
    table.rows = table.rows.map(row => row.filter((_, i) => i !== colIndex));
    onChange(updated);
  };

  // Update header
  const updateHeader = (tableIndex: number, colIndex: number, value: string) => {
    const updated = [...tables];
    updated[tableIndex].headers[colIndex] = value;
    onChange(updated);
  };

  // Add a row
  const addRow = (tableIndex: number) => {
    const updated = [...tables];
    const table = updated[tableIndex];
    const newRow = new Array(table.headers.length).fill("");
    table.rows = [...table.rows, newRow];
    onChange(updated);
  };

  // Remove a row
  const removeRow = (tableIndex: number, rowIndex: number) => {
    const updated = [...tables];
    const table = updated[tableIndex];
    if (table.rows.length <= 1) return; // Keep at least 1 row
    table.rows = table.rows.filter((_, i) => i !== rowIndex);
    onChange(updated);
  };

  // Update cell
  const updateCell = (tableIndex: number, rowIndex: number, colIndex: number, value: string) => {
    const updated = [...tables];
    updated[tableIndex].rows[rowIndex][colIndex] = value;
    onChange(updated);
  };

  // Move table up/down
  const moveTable = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === tables.length - 1) return;
    
    const updated = [...tables];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
    setExpandedTable(newIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-[#AEACA1] uppercase tracking-wider">
          Product Tables
        </label>
        <button
          type="button"
          onClick={addTable}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#CCAA4C] text-[#353535] text-xs font-bold uppercase tracking-wider hover:bg-[#CCAA4C]/80 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Table
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="bg-[#1f1c13] border border-[#AEACA1]/20 p-8 text-center">
          <Table className="w-10 h-10 text-[#AEACA1]/30 mx-auto mb-3" />
          <p className="text-[#AEACA1]/50 text-sm">No tables yet</p>
          <button
            type="button"
            onClick={addTable}
            className="mt-4 text-[#CCAA4C] text-xs font-bold uppercase tracking-wider hover:underline"
          >
            + Add your first table
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tables.map((table, tableIndex) => (
            <div
              key={tableIndex}
              className="bg-[#1f1c13] border border-[#AEACA1]/20 overflow-hidden"
            >
              {/* Table Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 bg-[#252219] cursor-pointer"
                onClick={() => setExpandedTable(expandedTable === tableIndex ? null : tableIndex)}
              >
                <GripVertical className="w-4 h-4 text-[#AEACA1]/50" />
                <Table className="w-4 h-4 text-[#CCAA4C]" />
                <input
                  type="text"
                  value={table.title}
                  onChange={(e) => updateTitle(tableIndex, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-transparent text-white font-bold text-sm focus:outline-none focus:bg-[#353535] px-2 py-1 -mx-2"
                  placeholder="Table Title"
                />
                <span className="text-xs text-[#AEACA1]/50">
                  {table.headers.length} cols × {table.rows.length} rows
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveTable(tableIndex, "up"); }}
                    disabled={tableIndex === 0}
                    className="p-1 text-[#AEACA1] hover:text-white disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveTable(tableIndex, "down"); }}
                    disabled={tableIndex === tables.length - 1}
                    className="p-1 text-[#AEACA1] hover:text-white disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeTable(tableIndex); }}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table Editor (Expanded) */}
              {expandedTable === tableIndex && (
                <div className="p-4">
                  {/* Table Grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      {/* Headers */}
                      <thead>
                        <tr>
                          <th className="w-8"></th>
                          {table.headers.map((header, colIndex) => (
                            <th key={colIndex} className="p-1">
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={header}
                                  onChange={(e) => updateHeader(tableIndex, colIndex, e.target.value)}
                                  className="w-full bg-[#353535] text-white text-xs font-bold px-2 py-2 border border-[#AEACA1]/30 focus:border-[#CCAA4C] focus:outline-none"
                                  placeholder="Header"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeColumn(tableIndex, colIndex)}
                                  className="p-1 text-red-400/50 hover:text-red-400"
                                  title="Remove column"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </th>
                          ))}
                          <th className="w-10">
                            <button
                              type="button"
                              onClick={() => addColumn(tableIndex)}
                              className="p-2 text-[#CCAA4C] hover:bg-[#CCAA4C]/20 w-full"
                              title="Add column"
                            >
                              <Plus className="w-4 h-4 mx-auto" />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      {/* Rows */}
                      <tbody>
                        {table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            <td className="p-1 text-center">
                              <button
                                type="button"
                                onClick={() => removeRow(tableIndex, rowIndex)}
                                className="p-1 text-red-400/50 hover:text-red-400"
                                title="Remove row"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                            {row.map((cell, colIndex) => (
                              <td key={colIndex} className="p-1">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => updateCell(tableIndex, rowIndex, colIndex, e.target.value)}
                                  className="w-full bg-[#252219] text-white text-sm px-2 py-2 border border-[#AEACA1]/20 focus:border-[#CCAA4C] focus:outline-none"
                                  placeholder="—"
                                />
                              </td>
                            ))}
                            <td></td>
                          </tr>
                        ))}
                        {/* Add Row Button */}
                        <tr>
                          <td></td>
                          <td colSpan={table.headers.length + 1} className="p-1">
                            <button
                              type="button"
                              onClick={() => addRow(tableIndex)}
                              className="w-full py-2 border border-dashed border-[#AEACA1]/30 text-[#AEACA1]/50 text-xs font-bold uppercase tracking-wider hover:border-[#CCAA4C] hover:text-[#CCAA4C] transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus className="w-3 h-3" />
                              Add Row
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-[#AEACA1]/20 flex gap-2">
                    <button
                      type="button"
                      onClick={() => addColumn(tableIndex)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#353535] text-[#AEACA1] text-xs font-bold uppercase tracking-wider hover:text-white transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Add Column
                    </button>
                    <button
                      type="button"
                      onClick={() => addRow(tableIndex)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#353535] text-[#AEACA1] text-xs font-bold uppercase tracking-wider hover:text-white transition-colors"
                    >
                      <ArrowDown className="w-3 h-3" />
                      Add Row
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-[#AEACA1]/50">
        Tables appear in the Description tab on product pages. Great for size charts, material specs, etc.
      </p>
    </div>
  );
}
