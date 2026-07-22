'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useWAStatus, useWASettings } from '@/lib/api-hooks'
import { QRCodeSVG } from 'qrcode.react'
import { 
  PhoneCall, 
  QrCode, 
  LogOut, 
  Send, 
  RefreshCw, 
  Smartphone, 
  Save, 
  MessageSquare, 
  Power, 
  Zap,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react'
import { toast } from 'sonner'

export default function WhatsAppPage() {
  const { waStatus, loading: waLoading, refetch: refetchWA, pair, logout, testSend } = useWAStatus()
  const { settings, loading: settingsLoading, saving: settingsSaving, triggering, updateSettingsBulk, triggerNow } = useWASettings()

  const [pairingLoading, setPairingLoading] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [testSending, setTestSending] = useState(false)
  const [activeQR, setActiveQR] = useState<string | null>(null)

  // Test Send Modal State
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Halo! Ini adalah pesan uji coba dari Sistem Absensi Sekolah.')

  // Settings local state
  const [waEnabled, setWaEnabled] = useState(true)
  const [messageTemplate, setMessageTemplate] = useState(
    'Assalamualaikum, kami informasikan bahwa anak Bapak/Ibu *{nama}* (NISN: {nisn}, Kelas: {kelas}) hari ini tercatat *{status}*. Mohon perhatiannya. Terima kasih.'
  )

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      if (settings.wa_enabled !== undefined) {
        setWaEnabled(settings.wa_enabled === 'true')
      }
      if (settings.wa_message_template) {
        setMessageTemplate(settings.wa_message_template)
      }
    }
  }, [settings])

  // Sync active QR from status
  useEffect(() => {
    if (waStatus?.qr) {
      setActiveQR(waStatus.qr)
    }
  }, [waStatus?.qr])

  // Auto-polling status when pairing
  useEffect(() => {
    const isPairing = waStatus?.status === 'pairing' || activeQR !== null
    if (!isPairing || waStatus?.status === 'connected') return

    const interval = setInterval(() => {
      refetchWA()
    }, 3000)

    return () => clearInterval(interval)
  }, [waStatus?.status, activeQR, refetchWA])

  const handlePairWA = async () => {
    setPairingLoading(true)
    toast.loading('Meminta QR Code Pairing dari server...')
    const res = await pair()
    toast.dismiss()

    if (res && 'qr' in res && (res as any).qr) {
      setActiveQR((res as any).qr)
      toast.success('QR Code Pairing berhasil dibuat! Silakan scan di HP.')
    } else {
      toast.success('Sesi pairing WhatsApp dimulai!')
    }
    setPairingLoading(false)
  }

  const handleLogoutWA = async () => {
    if (!confirm('Apakah Anda yakin ingin memutuskan koneksi WhatsApp bot?')) return
    setLogoutLoading(true)
    toast.loading('Memutuskan koneksi WhatsApp...')
    const res = await logout()
    toast.dismiss()
    if (res && !('error' in res)) {
      setActiveQR(null)
      toast.success('WhatsApp bot berhasil diputuskan!')
    } else {
      toast.error('Gagal memutuskan koneksi WhatsApp')
    }
    setLogoutLoading(false)
  }

  const handleTestSendWA = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanPhone = testPhone.trim().replace(/\D/g, '')
    if (!cleanPhone) {
      toast.error('Masukkan nomor WhatsApp tujuan (contoh: 6281234567890)')
      return
    }

    if (!testMessage.trim()) {
      toast.error('Pesan pengujian tidak boleh kosong')
      return
    }

    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone

    setTestSending(true)
    toast.loading('Mengirim pesan pengujian WA...')
    const res = await testSend(formattedPhone, testMessage)
    toast.dismiss()

    if (res && !('error' in res)) {
      toast.success('Pesan uji coba WA berhasil terkirim!')
      setTestModalOpen(false)
    } else {
      toast.error(res?.error || 'Gagal mengirim pesan uji coba WA')
    }
    setTestSending(false)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    toast.loading('Menyimpan konfigurasi WhatsApp...')
    
    const items = [
      { setting_key: 'wa_enabled', setting_value: String(waEnabled) },
      { setting_key: 'wa_message_template', setting_value: messageTemplate },
    ]

    const res = await updateSettingsBulk(items)
    toast.dismiss()

    if (res && !('error' in res)) {
      toast.success('Konfigurasi WhatsApp berhasil disimpan!')
    } else {
      toast.error('Gagal menyimpan konfigurasi WhatsApp')
    }
  }

  const handleTriggerNow = async () => {
    if (!confirm('Kirim notifikasi WhatsApp ke seluruh wali murid sekarang?')) return
    toast.loading('Memproses blast notifikasi WhatsApp...')
    const res = await triggerNow()
    toast.dismiss()
    if (res && !('error' in res)) {
      toast.success('Broadcast notifikasi WA berhasil dikirim!')
    } else {
      toast.error('Gagal mengirim broadcast notifikasi WA')
    }
  }

  const insertVariable = (variable: string) => {
    setMessageTemplate((prev) => prev + ` ${variable}`)
  }

  const isConnected = waStatus?.status === 'connected' || waStatus?.status === 'authenticated' || waStatus?.status === 'ready'
  const currentQRString = activeQR || waStatus?.qr
  const isPairing = !!currentQRString || waStatus?.status === 'pairing'

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative pb-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
            WhatsApp Bot & Notifikasi
          </h2>
          <p className="text-base text-muted-foreground mt-1 font-sans">
            Manajemen perangkat WhatsApp sekolah, scan QR Code pairing, dan broadcast notifikasi wali murid.
          </p>
        </div>

        <Button
          onClick={handleTriggerNow}
          disabled={triggering || !isConnected}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 px-5 gap-2 shadow-sm rounded-lg cursor-pointer"
        >
          <Zap className="h-4 w-4 fill-current" />
          {triggering ? 'Mengirim Broadcast...' : 'Kirim Broadcast Notifikasi WA'}
        </Button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Device Status & Pairing */}
        <div className="lg:col-span-12 flex flex-col gap-6">

          {/* Card 1: Device Status & Pairing */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm p-6 relative overflow-hidden"
            style={{ borderTopWidth: 4, borderTopColor: isConnected ? '#10b981' : isPairing ? '#f59e0b' : '#ef4444' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${isConnected ? 'bg-emerald-50 text-emerald-600' : isPairing ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">Status Perangkat WhatsApp Bot</h3>
                  <p className="text-xs text-muted-foreground font-sans">Scan QR Code menggunakan aplikasi WhatsApp di HP sekolah</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline"
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    isConnected 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : isPairing 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-emerald-500 animate-pulse' : isPairing ? 'bg-amber-500 animate-ping' : 'bg-rose-500'}`} />
                  {isConnected ? 'Terhubung (Connected)' : isPairing ? 'Meminta Scan (Pairing)' : 'Terputus (Disconnected)'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetchWA()}
                  disabled={waLoading}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Refresh Status WA"
                >
                  <RefreshCw className={`h-4 w-4 ${waLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* WA Pairing & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center font-sans">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  WhatsApp Gateway berfungsi untuk mengirimkan pesan pengumuman & notifikasi absensi harian siswa langsung ke nomor WhatsApp wali murid secara otomatis.
                </p>

                {waStatus?.phone && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs space-y-1">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Nomor Pengirim Terhubung</span>
                    <span className="font-mono font-bold text-emerald-900 text-sm">{waStatus.phone}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {!isConnected && (
                    <Button
                      onClick={handlePairWA}
                      disabled={pairingLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 gap-2 cursor-pointer shadow-sm"
                    >
                      <QrCode className="h-4 w-4" />
                      {pairingLoading ? 'Memproses...' : 'Sambungkan WA (Scan QR)'}
                    </Button>
                  )}

                  {isConnected && (
                    <Button
                      onClick={handleLogoutWA}
                      disabled={logoutLoading}
                      variant="outline"
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs h-10 gap-2 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      {logoutLoading ? 'Memproses...' : 'Putuskan Koneksi WA'}
                    </Button>
                  )}

                  <Button
                    onClick={() => setTestModalOpen(true)}
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs h-10 gap-2 cursor-pointer"
                  >
                    <Send className="h-4 w-4 text-indigo-500" />
                    Uji Kirim Pesan WA
                  </Button>
                </div>
              </div>

              {/* Pairing QR Display */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center min-h-[220px] relative text-center">
                {currentQRString ? (
                  <div className="space-y-3">
                    <div className="bg-white p-3 border-4 border-indigo-500 rounded-xl shadow-lg inline-block animate-pulse">
                      <QRCodeSVG value={currentQRString} size={180} level="M" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">Scan QR Code dengan WhatsApp HP Sekolah</p>
                      <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <HelpCircle className="h-3 w-3 text-indigo-500" />
                        Buka WA HP ➔ Perangkat Tertaut ➔ Tautkan Perangkat
                      </p>
                    </div>
                  </div>
                ) : isConnected ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <PhoneCall className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800">WhatsApp Gateway Siap Digunakan</p>
                    <p className="text-[11px] text-slate-500 max-w-[200px] leading-snug">Bot aktif dan siap mengirim notifikasi absensi ke wali murid.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Smartphone className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Belum Ada Sesi WhatsApp</p>
                    <p className="text-[11px] text-slate-500 max-w-[240px]">Klik <b>"Sambungkan WA (Scan QR)"</b> untuk menampilkan kode QR pairing.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Card 2: Configuration & Message Template */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm p-6 relative"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">Pengaturan Pesan WhatsApp</h3>
                  <p className="text-xs text-muted-foreground font-sans">Atur sakelar pengiriman dan template pesan WhatsApp ke wali murid</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 font-sans">
              {/* Toggle Automatic WA */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Power className={`h-4 w-4 ${waEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-bold text-slate-900">Notifikasi WA Otomatis</span>
                  </div>
                  <p className="text-xs text-slate-500">Aktifkan pengiriman pesan WhatsApp otomatis setiap hari</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWaEnabled(!waEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    waEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      waEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Template Editor */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Template Pesan WhatsApp
                  </label>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Klik Tag:</span>
                    {['{nama}', '{nisn}', '{kelas}', '{status}'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="px-2 py-0.5 text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100 cursor-pointer transition-colors"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Tuliskan template pesan notifikasi WhatsApp..."
                  className="w-full p-3.5 bg-background border border-border rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
                <p className="text-[11px] text-muted-foreground">
                  Gunakan tag seperti <code className="bg-muted px-1 py-0.5 rounded font-mono text-foreground">{'{nama}'}</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono text-foreground">{'{kelas}'}</code>, dan <code className="bg-muted px-1 py-0.5 rounded font-mono text-foreground">{'{status}'}</code> agar pesan terisi otomatis sesuai data siswa.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={settingsSaving || settingsLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 px-6 gap-2 rounded-lg cursor-pointer shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  {settingsSaving ? 'Menyimpan...' : 'Simpan Konfigurasi WA'}
                </Button>
              </div>
            </form>
          </motion.section>
        </div>
      </div>

      {/* Test Message Modal */}
      <AnimatePresence>
        {testModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-card rounded-2xl p-6 max-w-md w-full relative shadow-2xl border border-border space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-serif text-lg font-bold text-foreground">Uji Kirim Pesan WhatsApp</h3>
                </div>
                <button
                  onClick={() => setTestModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleTestSendWA} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Nomor WhatsApp Tujuan (WA)
                  </label>
                  <Input
                    required
                    type="text"
                    placeholder="Contoh: 6281234567890"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">Gunakan format 628xxx atau 08xxx</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Pesan Uji Coba
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Tuliskan isi pesan pengujian..."
                    className="w-full p-3 bg-background border border-border rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTestModalOpen(false)}
                    className="text-xs font-semibold"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={testSending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 gap-2 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {testSending ? 'Mengirim...' : 'Kirim Uji Coba'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
