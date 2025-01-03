export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      CenovnikVeljko: {
        Row: {
          Cena: number
          created_at: string
          "Jedinica mere": string
          Naziv: string
          Proizvođač: string
        }
        Insert: {
          Cena: number
          created_at?: string
          "Jedinica mere": string
          Naziv: string
          Proizvođač: string
        }
        Update: {
          Cena?: number
          created_at?: string
          "Jedinica mere"?: string
          Naziv?: string
          Proizvođač?: string
        }
        Relationships: []
      }
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
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_products: {
        Row: {
          Cena: number
          created_at: string
          id: string
          "Jedinica mere": string
          Naziv: string
          Proizvođač: string
          user_id: string | null
        }
        Insert: {
          Cena: number
          created_at?: string
          id?: string
          "Jedinica mere": string
          Naziv: string
          Proizvođač: string
          user_id?: string | null
        }
        Update: {
          Cena?: number
          created_at?: string
          id?: string
          "Jedinica mere"?: string
          Naziv?: string
          Proizvođač?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_duplicate_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      "Kupci Darko": {
        Row: {
          Adresa: string
          "GPS Koordinate": string | null
          Grad: string
          "Naziv kupca": string
          "PDV Obveznik": string
          PIB: string
          "Šifra kupca": number
          Telefon: string
        }
        Insert: {
          Adresa: string
          "GPS Koordinate"?: string | null
          Grad: string
          "Naziv kupca": string
          "PDV Obveznik": string
          PIB: string
          "Šifra kupca": number
          Telefon: string
        }
        Update: {
          Adresa?: string
          "GPS Koordinate"?: string | null
          Grad?: string
          "Naziv kupca"?: string
          "PDV Obveznik"?: string
          PIB?: string
          "Šifra kupca"?: number
          Telefon?: string
        }
        Relationships: []
      }
      "Kupci Veljko": {
        Row: {
          Adresa: string
          "GPS Koordinate": string | null
          Grad: string
          "Naziv kupca": string
          "PDV Obveznik": string
          PIB: string
          "Šifra kupca": number
          Telefon: string
        }
        Insert: {
          Adresa: string
          "GPS Koordinate"?: string | null
          Grad: string
          "Naziv kupca": string
          "PDV Obveznik": string
          PIB: string
          "Šifra kupca": number
          Telefon: string
        }
        Update: {
          Adresa?: string
          "GPS Koordinate"?: string | null
          Grad?: string
          "Naziv kupca"?: string
          "PDV Obveznik"?: string
          PIB?: string
          "Šifra kupca"?: number
          Telefon?: string
        }
        Relationships: []
      }
      KupciVeljko: {
        Row: {
          Adresa: string
          "GPS Koordinate": string | null
          Grad: string
          "Naziv kupca": string
          "PDV Obveznik": string
          PIB: string
          "Šifra kupca": number
          Telefon: string
        }
        Insert: {
          Adresa: string
          "GPS Koordinate"?: string | null
          Grad: string
          "Naziv kupca": string
          "PDV Obveznik": string
          PIB: string
          "Šifra kupca": number
          Telefon: string
        }
        Update: {
          Adresa?: string
          "GPS Koordinate"?: string | null
          Grad?: string
          "Naziv kupca"?: string
          "PDV Obveznik"?: string
          PIB?: string
          "Šifra kupca"?: number
          Telefon?: string
        }
        Relationships: []
      }
      order_templates: {
        Row: {
          created_at: string
          id: string
          items: Json
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          items: Json
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          Cena: number
          created_at: string
          id: string
          "Jedinica mere": string
          Naziv: string
          Proizvođač: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          Cena: number
          created_at?: string
          id?: string
          "Jedinica mere": string
          Naziv: string
          Proizvođač: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          Cena?: number
          created_at?: string
          id?: string
          "Jedinica mere"?: string
          Naziv?: string
          Proizvođač?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products_darko: {
        Row: {
          Cena: number
          created_at: string
          "Jedinica mere": string
          Naziv: string
          Proizvođač: string
        }
        Insert: {
          Cena: number
          created_at?: string
          "Jedinica mere": string
          Naziv: string
          Proizvođač: string
        }
        Update: {
          Cena?: number
          created_at?: string
          "Jedinica mere"?: string
          Naziv?: string
          Proizvođač?: string
        }
        Relationships: []
      }
      ProductsVeljko: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
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
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string | null
          customer_id: string | null
          date: string | null
          id: string
          items: Json
          payment_type: string
          total: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          date?: string | null
          id?: string
          items: Json
          payment_type: string
          total: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          date?: string | null
          id?: string
          items?: Json
          payment_type?: string
          total?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      citext:
        | {
            Args: {
              "": boolean
            }
            Returns: string
          }
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      citext_hash: {
        Args: {
          "": string
        }
        Returns: number
      }
      citextin: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      citextout: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      citextrecv: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      citextsend: {
        Args: {
          "": string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
