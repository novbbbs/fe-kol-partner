import { z } from 'zod';

export const reservasiSchema = z.object({
  id_order: z.number().optional(),
  kode_booking: z.string().min(1, 'Kode booking wajib diisi'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  nama_kol: z.string().min(1, 'Nama KOL wajib diisi'),
  type_kol: z.string().min(1, 'Tipe KOL wajib diisi'),
  total_bayar: z.number().min(0, 'Total bayar tidak boleh kurang dari 0'),
  status: z.string().optional(),
});

export type ReservasiFormData = z.infer<typeof reservasiSchema>;