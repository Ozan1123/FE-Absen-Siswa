'use client'

import { motion } from 'framer-motion'
import { Token } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Trash2, Clock, Tag } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface TokenHistoryTableProps {
  tokens: Token[]
  loading: boolean
  onDelete: (id: string) => void
}

export function TokenHistoryTable({ tokens, loading, onDelete }: TokenHistoryTableProps) {
  if (loading) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <LoadingSpinner message="Memuat daftar token..." />
      </div>
    )
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Clock className="h-6 w-6 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Tidak ada token aktif</h3>
        <p className="text-slate-400 text-sm">Belum ada token absensi yang dibuat atau semua token sudah kedaluwarsa.</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          Daftar QR Aktif
        </h3>
        <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
          Total: {tokens.length}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700/50">
            <tr>
              <th className="px-6 py-4 font-medium">Kode Token</th>
              <th className="px-6 py-4 font-medium">Kategori</th>
              <th className="px-6 py-4 font-medium">Berlaku Sampai</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {tokens.map((token, idx) => (
              <motion.tr 
                key={token.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-lg font-bold text-white tracking-widest">{token.token_code}</span>
                </td>
                <td className="px-6 py-4">
                  {token.category === 'telat' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      TELAT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      HADIR
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {token.validUntil ? new Date(token.validUntil).toLocaleTimeString('id-ID', {
                    hour: '2-digit', minute: '2-digit'
                  }) : '-'}
                </td>
                <td className="px-6 py-4">
                  {token.is_active ? (
                    <span className="text-emerald-400 text-xs font-medium">Aktif</span>
                  ) : (
                    <span className="text-red-400 text-xs font-medium">Expired</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(String(token.id))}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 rounded-lg"
                    title="Hapus token"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
