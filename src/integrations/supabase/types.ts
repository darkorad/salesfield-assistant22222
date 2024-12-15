export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          address: string
          city: string
          code: string
          created_at: string
          gps_coordinates: string | null
          id: string
          is_vat_registered: boolean | null
          name: string
          phone: string | null
          pib: string
          user_id: string | null
        }
        Insert: {
          address: string
          city: string
          code: string
          created_at?: string
          gps_coordinates?: string | null
          id?: string
          is_vat_registered?: boolean | null
          name: string
          phone?: string | null
          pib: string
          user_id?: string | null
        }
        Update: {
          address?: string
          city?: string
          code?: string
          created_at?: string
          gps_coordinates?: string | null
          id?: string
          is_vat_registered?: boolean | null
          name?: string
          phone?: string | null
          pib?: string
          user_id?: string | null
        }
      }
      products: {
        Row: {
          id: string
          user_id: string | null
          Naziv: string
          Proizvođač: string
          Cena: number
          "Jedinica mere": string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          Naziv: string
          Proizvođač: string
          Cena: number
          "Jedinica mere": string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          Naziv?: string
          Proizvođač?: string
          Cena?: number
          "Jedinica mere"?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string
          role: string
        }
        Insert: {
          id: string
          name: string
          role?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']