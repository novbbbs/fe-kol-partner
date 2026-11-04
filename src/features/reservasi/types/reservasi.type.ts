export interface Reservasi {
  id: number | string;
  id_order: string;
  kode_booking: string;
  nama: string;
  email: string;
  nama_kol: string;
  type_kol: string;
  total_bayar: number | string;
  qty: number;
  kedatangan: string;
  status: string | number;
}