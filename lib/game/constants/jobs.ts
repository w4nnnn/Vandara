export interface Job {
  id: string
  label: string
  pay: number           // money per work action
  xp: number            // xp per work action
  nerveCost: number
  levelRequired: number
  description: string
}

export const JOBS: Job[] = [
  { id: 'grocer', label: 'Tukang Sayur', pay: 50, xp: 5, nerveCost: 2, levelRequired: 1, description: 'Tata rak dan layani pelanggan.' },
  { id: 'cashier', label: 'Kasir', pay: 80, xp: 8, nerveCost: 3, levelRequired: 2, description: 'Tangani transaksi di toko ramai.' },
  { id: 'mechanic', label: 'Montir', pay: 150, xp: 15, nerveCost: 5, levelRequired: 5, description: 'Perbaiki mobil dan dapatkan uang lumayan.' },
  { id: 'security', label: 'Satpam', pay: 250, xp: 20, nerveCost: 7, levelRequired: 8, description: 'Jaga gedung. Termasuk tunjangan bahaya.' },
  { id: 'programmer', label: 'Programmer', pay: 400, xp: 30, nerveCost: 8, levelRequired: 12, description: 'Tulis kode untuk perusahaan teknologi.' },
  { id: 'lawyer', label: 'Pengacara', pay: 700, xp: 50, nerveCost: 10, levelRequired: 18, description: 'Wakili klien di pengadilan.' },
  { id: 'doctor', label: 'Dokter', pay: 1000, xp: 75, nerveCost: 12, levelRequired: 25, description: 'Selamatkan nyawa dan dapatkan gaji tertinggi.' },
]
