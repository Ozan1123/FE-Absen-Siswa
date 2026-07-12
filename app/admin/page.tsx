'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  CheckCircle2,
  HeartPulse,
  AlertTriangle,
  Award,
  Calendar
} from 'lucide-react'
import { CustomSvgChart } from '@/components/custom-svg-chart'
import { AdvancedAttendanceTable, StudentAttendance } from '@/components/advanced-attendance-table'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAttendanceChart, useMonitoringData } from '@/lib/api-hooks'
import { containerVariants, itemVariants } from '@/lib/constants'

type TrendChartItem = {
  date: string
  Hadir?: number
  Telat?: number
  Sakit?: number
  Alpa?: number
  Belum?: number
  [key: string]: unknown
}

export default function DashboardPage() {
  const { data: chartData, loading: chartLoading } = useAttendanceChart()
  const { data: monitoringData, loading: monitoringLoading, updateStatus, updateMultipleStatuses } = useMonitoringData({
    class_group: 'all',
    status: 'all'
  })

  const isDataLoading = chartLoading || monitoringLoading

  // Compute live statistics from monitoring data
  const rawStudents = (monitoringData?.data || []) as StudentAttendance[]
  const totalStudents = rawStudents.length

  const countHadir = rawStudents.filter((s) => s.status === 'hadir').length
  const countTelat = rawStudents.filter((s) => s.status === 'telat').length
  const countSakit = rawStudents.filter((s) => s.status === 'sakit').length
  const countAlfa = rawStudents.filter((s) => s.status === 'alfa').length
  const countBelumAbsen = rawStudents.filter((s) => s.status === 'belum_absen').length

  const totalPresent = countHadir + countTelat
  const attendanceRate = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0

  const liveStatusSummary = {
    Hadir: countHadir,
    Telat: countTelat,
    Sakit: countSakit,
    Alpa: countAlfa,
    Belum: countBelumAbsen,
  }

  // Build chart data from real attendance status counts when available.
  const trend7DaysData = (() => {
    const emptySeries = {
      Hadir: 0,
      Telat: 0,
      Sakit: 0,
      Alpa: 0,
      Belum: 0,
    }

    if (chartData && chartData.length > 0) {
      const normalized = chartData.map((item: TrendChartItem, index: number) => {
        const hasStatusBreakdown = ['Hadir', 'Telat', 'Sakit', 'Alpa', 'Belum'].some(
          (key) => typeof item[key] === 'number'
        )

        if (hasStatusBreakdown) {
          return {
            date: new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' }),
            Hadir: Number(item.Hadir ?? 0),
            Telat: Number(item.Telat ?? 0),
            Sakit: Number(item.Sakit ?? 0),
            Alpa: Number(item.Alpa ?? 0),
            Belum: Number(item.Belum ?? 0),
          }
        }

        const isLastItem = index === chartData.length - 1
        return {
          date: new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' }),
          ...(isLastItem ? liveStatusSummary : emptySeries),
        }
      })

      if (normalized.length > 0) {
        return normalized
      }
    }

    return Array.from({ length: 7 }, (_, i) => {
      const isLast = i === 6
      return {
        date: isLast ? 'Hari Ini' : `H-${7 - i}`,
        ...(isLast ? liveStatusSummary : emptySeries),
      }
    })
  })()

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Handle local state edit fallback for inline remarks/timestamp updates
  const handleUpdateDetails = (
    userId: number,
    timestamp: string | undefined,
    remarks: string | undefined
  ) => {
    void userId
    void timestamp
    void remarks
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
            </span>
            <span className="text-[10px] text-indigo-700 font-bold tracking-[1.5px] uppercase">
              SISTEM PRESENSI AKTIF (SLATE/INDIGO)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1 font-[family-name:var(--font-playfair)]">
            Selamat Datang, Admin
          </h1>
          <p className="text-slate-500 text-xs font-light flex items-center gap-1.5 leading-none">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {today}
          </p>
        </div>
      </motion.div>

      {/* Real-time Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {/* Card 1: Total Siswa */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Siswa</span>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-950">{totalStudents}</div>
            <div className="text-[10px] text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{countBelumAbsen}</span> Belum Absen
            </div>
          </div>
        </motion.div>

        {/* Card 2: Hadir & Terlambat */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Hadir & Telat</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-950">{totalPresent}</div>
            <div className="text-[10px] text-slate-500 mt-1">
              <span className="font-semibold text-emerald-600">{countHadir} H</span> |{' '}
              <span className="font-semibold text-amber-600">{countTelat} T</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Sakit */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sakit</span>
            <HeartPulse className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-950">{countSakit}</div>
            <div className="text-[10px] text-orange-600 font-medium mt-1">
              Dokumentasi Medis
            </div>
          </div>
        </motion.div>

        {/* Card 4: Alpa */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Alpa</span>
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-950">{countAlfa}</div>
            <div className="text-[10px] text-rose-600 font-medium mt-1 animate-pulse">
              Butuh Tindak Lanjut
            </div>
          </div>
        </motion.div>

        {/* Card 5: Rasio Kehadiran */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px] bg-indigo-50/20 border-indigo-100"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700">Rasio Kehadiran</span>
            <Award className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-900">{attendanceRate}%</div>
            <div className="text-[10px] text-indigo-600 font-medium mt-1">
              Target sekolah &gt; 90%
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Trends Custom SVG Stacked Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        {isDataLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-16 flex items-center justify-center h-72 shadow-sm">
            <LoadingSpinner message="Menyiapkan infografis tren kehadiran..." />
          </div>
        ) : (
          <CustomSvgChart data={trend7DaysData} />
        )}
      </motion.div>

      {/* Main Today's Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="space-y-4"
      >
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Presensi Harian Siswa (Hari Ini)</h2>
          <p className="text-xs text-slate-500 font-light">Kelola log dan perbarui status absensi siswa secara langsung</p>
        </div>

        <AdvancedAttendanceTable
          students={rawStudents}
          loading={isDataLoading}
          onUpdateStatus={updateStatus}
          onUpdateMultipleStatuses={updateMultipleStatuses}
          onUpdateDetails={handleUpdateDetails}
        />
      </motion.div>
    </div>
  )
}