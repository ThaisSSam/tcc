import React, { useState, useEffect, useRef } from 'react';
import { flexRender } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface BaseDataTableProps {
  table: any;
  isLoading?: boolean;
  enablePagination?: boolean;
  enableColumnResizing?: boolean;
  alturaAutomatica?: boolean;
  rolagemHorizontalExterna?: boolean;
}

// Calcula dinamicamente o offset 'left' para colunas fixadas à esquerda
const getLeftPinnedStyles = (
  headerOrCell: any,
  index: number,
  allHeadersOrCells: any[],
  isHeader: boolean
): React.CSSProperties => {
  const columnId = headerOrCell.column ? headerOrCell.column.id : headerOrCell.id;
  
  // As colunas fixas à esquerda são 'favorito' e 'acoes'
  const isPinned = columnId === 'favorito' || columnId === 'acoes';
  if (!isPinned) return {};

  // Calcula a soma da largura das colunas anteriores que também são fixadas à esquerda
  let leftOffset = 0;
  for (let i = 0; i < index; i++) {
    const prevCol = allHeadersOrCells[i];
    const prevId = prevCol.column ? prevCol.column.id : prevCol.id;
    if (prevId === 'favorito' || prevId === 'acoes') {
      leftOffset += prevCol.column ? prevCol.column.getSize() : prevCol.getSize();
    }
  }

  return {
    position: 'sticky',
    left: `${leftOffset}px`,
    zIndex: isHeader ? 30 : 20,
    backgroundColor: isHeader ? '#0f172a' : '#131b2e',
    boxShadow: '2px 0 6px -2px rgba(0, 0, 0, 0.4)',
  };
};

export function BaseDataTable({
  table,
  isLoading = false,
  enablePagination = true,
  enableColumnResizing = true,
  alturaAutomatica = false,
  rolagemHorizontalExterna = false,
}: BaseDataTableProps) {
  const rows = table.getRowModel().rows;
  const headerGroups = table.getHeaderGroups();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isPageSizeDropdownOpen, setIsPageSizeDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPageSizeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const classeRaizTabela = alturaAutomatica
    ? 'w-full flex flex-col'
    : 'w-full h-full flex flex-col justify-between';

  const classeCorpoRolagem = rolagemHorizontalExterna
    ? alturaAutomatica
      ? 'max-w-full overflow-x-visible overflow-y-visible'
      : 'flex-1 min-h-0 max-w-full overflow-x-visible overflow-y-visible'
    : alturaAutomatica
      ? 'scrollbar-thin overflow-x-auto'
      : 'scrollbar-thin flex-1 min-h-0 overflow-x-auto overflow-y-auto';

  return (
    <div className={classeRaizTabela}>
      <div className={classeCorpoRolagem}>
        <table 
          className="w-full border-separate border-spacing-0"
          style={{
            tableLayout: 'fixed',
            width: table.getTotalSize ? `${table.getTotalSize()}px` : '100%',
            minWidth: '100%',
          }}
        >
          {/* CABEÇALHO */}
          <thead className="border-b border-slate-800 sticky top-0 z-20 bg-[#0f172a]/95 backdrop-blur-sm">
            {headerGroups.map((headerGroup: any) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: any, index: number) => {
                  const size = header.getSize();
                  const minSize = header.column.columnDef.minSize;
                  const maxSize = header.column.columnDef.maxSize;
                  const canResize = header.column.getCanResize?.() && header.column.columnDef.enableResizing !== false;

                  return (
                    <th
                      key={header.id}
                      className="text-left text-xs font-semibold text-slate-400 border-b border-r border-slate-800/60 py-3.5 px-4 uppercase tracking-wider whitespace-nowrap relative group select-none overflow-hidden"
                      style={{
                        width: `${size}px`,
                        minWidth: minSize ? `${minSize}px` : undefined,
                        maxWidth: maxSize ? `${maxSize}px` : undefined,
                        ...getLeftPinnedStyles(header, index, headerGroup.headers, true),
                      }}
                    >
                      <div className="truncate pr-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>

                      {enableColumnResizing && canResize && (
                        <div
                          onMouseDown={header.getResizeHandler?.()}
                          onTouchStart={header.getResizeHandler?.()}
                          className={`absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none touch-none transition-all z-10 ${
                            header.column.getIsResizing?.()
                              ? 'bg-blue-500 w-1 opacity-100'
                              : 'bg-transparent group-hover:bg-blue-500/50'
                          }`}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* CORPO */}
          <tbody className="divide-y divide-slate-800/60 bg-[#131b2e]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={headerGroups[0]?.headers.length || 1}
                  className="text-center py-10 text-slate-500 text-xs italic"
                >
                  Carregando dados...
                </td>
              </tr>
            ) : rows?.length ? (
              rows.map((row: any) => {
                const cells = row.getVisibleCells();
                return (
                  <tr
                    key={row.id}
                    className="border-b border-slate-800/40 hover:bg-[#1e293b]/40 transition-colors text-xs text-slate-300"
                  >
                    {cells.map((cell: any, index: number) => {
                      const size = cell.column.getSize();
                      const minSize = cell.column.columnDef.minSize;
                      const maxSize = cell.column.columnDef.maxSize;

                      return (
                        <td
                          key={cell.id}
                          className="py-3 px-4 border-b border-r border-slate-800/40 align-middle overflow-hidden"
                          style={{
                            width: `${size}px`,
                            minWidth: minSize ? `${minSize}px` : undefined,
                            maxWidth: maxSize ? `${maxSize}px` : undefined,
                            ...getLeftPinnedStyles(cell, index, cells, false),
                          }}
                        >
                          <div className="w-full truncate">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={headerGroups[0]?.headers.length || 1}
                  className="text-center py-10 text-slate-500 text-xs"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINAÇÃO */}
      {enablePagination && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#0f172a]/60 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex-1">
            <span>
              Total de <strong>{table.getFilteredRowModel().rows.length}</strong> registro(s)
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-slate-400">Linhas por página</p>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsPageSizeDropdownOpen(!isPageSizeDropdownOpen)}
                  className="flex items-center gap-1.5 bg-[#131b2e] border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 hover:border-slate-700 outline-none cursor-pointer"
                >
                  {table.getState().pagination.pageSize}
                  <ChevronDown size={13} className="text-slate-400" />
                </button>

                {isPageSizeDropdownOpen && (
                  <div className="absolute bottom-full right-0 mb-1.5 bg-[#131b2e] border border-slate-800 rounded-lg z-50 py-1 min-w-[80px]">
                    {[5, 10, 20, 50].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          table.setPageSize(size);
                          setIsPageSizeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 text-xs transition-colors cursor-pointer ${
                          table.getState().pagination.pageSize === size
                            ? 'text-blue-400 font-semibold bg-blue-500/10'
                            : 'text-slate-300'
                        }`}
                      >
                        {size} linhas
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="font-medium text-slate-300">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                className="p-1.5 bg-[#131b2e] border border-slate-800 text-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                title="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="p-1.5 bg-[#131b2e] border border-slate-800 text-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                title="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}