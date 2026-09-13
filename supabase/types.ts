export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      afectat: {
        Row: {
          centro_id: string | null
          edat: string | null
          id: string
          orientacio: string | null
          ref_incident: string | null
          ref_pacient: string | null
          sexe: string | null
        }
        Insert: {
          centro_id?: string | null
          edat?: string | null
          id?: string
          orientacio?: string | null
          ref_incident?: string | null
          ref_pacient?: string | null
          sexe?: string | null
        }
        Update: {
          centro_id?: string | null
          edat?: string | null
          id?: string
          orientacio?: string | null
          ref_incident?: string | null
          ref_pacient?: string | null
          sexe?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "afectat_ref_incident_fkey"
            columns: ["ref_incident"]
            isOneToOne: false
            referencedRelation: "incident"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afectat_ref_pacient_fkey"
            columns: ["ref_pacient"]
            isOneToOne: false
            referencedRelation: "pacient"
            referencedColumns: ["id"]
          },
        ]
      }
      centers: {
        Row: {
          address: string | null
          center_code: string | null
          city: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          province: string | null
          study_type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          center_code?: string | null
          city?: string | null
          created_at?: string | null
          id: string
          name: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          study_type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          center_code?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          study_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "student_profiles"
            referencedColumns: ["student_id"]
          },
        ]
      }
      incident: {
        Row: {
          centro_id: string | null
          comarca: string | null
          id: string
          localitzacio: string | null
          motiu: string | null
          municipi: string | null
          provincia: string | null
          timestamp: string | null
        }
        Insert: {
          centro_id?: string | null
          comarca?: string | null
          id?: string
          localitzacio?: string | null
          motiu?: string | null
          municipi?: string | null
          provincia?: string | null
          timestamp?: string | null
        }
        Update: {
          centro_id?: string | null
          comarca?: string | null
          id?: string
          localitzacio?: string | null
          motiu?: string | null
          municipi?: string | null
          provincia?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      incident_recurs: {
        Row: {
          ref_incident: string
          ref_recurs: string
        }
        Insert: {
          ref_incident: string
          ref_recurs: string
        }
        Update: {
          ref_incident?: string
          ref_recurs?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_recurs_ref_incident_fkey"
            columns: ["ref_incident"]
            isOneToOne: false
            referencedRelation: "incident"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_recurs_ref_recurs_fkey"
            columns: ["ref_recurs"]
            isOneToOne: false
            referencedRelation: "recurs"
            referencedColumns: ["id"]
          },
        ]
      }
      informe: {
        Row: {
          acr: string | null
          acr_presenciada: string | null
          activitat_esportiva: string | null
          agitat: string | null
          allergies: string | null
          alteracio_neurologica: string | null
          altres_actuants_no_sem: string | null
          altres_actuants_sem: string | null
          antecedents: string | null
          aparell_locomotor_text: string | null
          apgar_color: number | null
          apgar_estimuls: number | null
          apgar_fc: number | null
          apgar_resp: number | null
          apgar_to: number | null
          centro_id: string | null
          cim_codi1: string | null
          cim_codi2: string | null
          cim_codi3: string | null
          cim_desc1: string | null
          cim_desc2: string | null
          cim_desc3: string | null
          circulacio: string | null
          codi_gravetat: string | null
          codi_pre_activacio: string | null
          companyia_doble_cobertura: string | null
          cura_topica: string | null
          data: string | null
          descripcio_dea: string | null
          descripcio_fets: string | null
          doble_cobertura: string | null
          dolor_toracic: string | null
          entregat_a: string | null
          eva_score: number | null
          evaluated_scales: Json | null
          existeix_doble_cobertura: string | null
          final_dreta_reactivitat: string | null
          final_dreta_size: string | null
          final_esquerra_reactivitat: string | null
          final_esquerra_size: string | null
          finalitzacio_pacient: string | null
          finalitzacio_unitat: string | null
          glasgow_lactant: string | null
          glasgow_motor: number | null
          glasgow_ocular: number | null
          glasgow_verbal: number | null
          habits_toxics: string | null
          hemostasia: string | null
          hora: string | null
          id: string
          inicial_dreta_reactivitat: string | null
          inicial_dreta_size: string | null
          inicial_esquerra_reactivitat: string | null
          inicial_esquerra_size: string | null
          itp_consciencia: number | null
          itp_ferides: number | null
          itp_fractures: number | null
          itp_pes: number | null
          itp_tas: number | null
          itp_via_aeria: number | null
          killip_class: number | null
          lesion_markers: Json | null
          malinas_durada_contraccions: number | null
          malinas_durada_part: number | null
          malinas_embarassos: number | null
          malinas_interval_contraccions: number | null
          malinas_trencament_bossa: number | null
          material_seguretat: string | null
          matricula_vehicle: string | null
          matricula_vehicle_contrari: string | null
          mobilitzacions: string | null
          monitores_rows: Json | null
          news2_selections: Json | null
          nivell_consciencia: string | null
          num_asseguranca: string | null
          objectes: string | null
          objectes_personals: string | null
          observacions: string | null
          observacions_doble_cobertura: string | null
          ompliment_capillar: string | null
          pacient_lloc_assistencia: string | null
          patrick_score: number | null
          pell: string | null
          pols: string | null
          posicio_pacient_vehicle: string | null
          race_afa_agn: number | null
          race_brac: number | null
          race_cama: number | null
          race_facial: number | null
          race_hemicos: string | null
          race_ocular: number | null
          rancom_lavabo: string | null
          rancom_moure: string | null
          rancom_vestir: string | null
          rapid_bracos: string | null
          rapid_cara: string | null
          rapid_parla: string | null
          rcp_previa: string | null
          ref_afectat: string | null
          ref_cognoms: string | null
          ref_email: string | null
          ref_incident: string | null
          ref_nom: string | null
          ref_telefon: string | null
          ref_tes1: string | null
          ref_tes2: string | null
          ref_tipus: string | null
          respiracio: string | null
          situacio_implicats: string | null
          timestamp: string | null
          tipus_doble_cobertura: string | null
          tipus_trasllat: string | null
          trasllat: string | null
          trts_fr: number | null
          trts_gcs: number | null
          trts_tas: number | null
          vehicles_implicats: string | null
          via_aeria: string | null
        }
        Insert: {
          acr?: string | null
          acr_presenciada?: string | null
          activitat_esportiva?: string | null
          agitat?: string | null
          allergies?: string | null
          alteracio_neurologica?: string | null
          altres_actuants_no_sem?: string | null
          altres_actuants_sem?: string | null
          antecedents?: string | null
          aparell_locomotor_text?: string | null
          apgar_color?: number | null
          apgar_estimuls?: number | null
          apgar_fc?: number | null
          apgar_resp?: number | null
          apgar_to?: number | null
          centro_id?: string | null
          cim_codi1?: string | null
          cim_codi2?: string | null
          cim_codi3?: string | null
          cim_desc1?: string | null
          cim_desc2?: string | null
          cim_desc3?: string | null
          circulacio?: string | null
          codi_gravetat?: string | null
          codi_pre_activacio?: string | null
          companyia_doble_cobertura?: string | null
          cura_topica?: string | null
          data?: string | null
          descripcio_dea?: string | null
          descripcio_fets?: string | null
          doble_cobertura?: string | null
          dolor_toracic?: string | null
          entregat_a?: string | null
          eva_score?: number | null
          evaluated_scales?: Json | null
          existeix_doble_cobertura?: string | null
          final_dreta_reactivitat?: string | null
          final_dreta_size?: string | null
          final_esquerra_reactivitat?: string | null
          final_esquerra_size?: string | null
          finalitzacio_pacient?: string | null
          finalitzacio_unitat?: string | null
          glasgow_lactant?: string | null
          glasgow_motor?: number | null
          glasgow_ocular?: number | null
          glasgow_verbal?: number | null
          habits_toxics?: string | null
          hemostasia?: string | null
          hora?: string | null
          id?: string
          inicial_dreta_reactivitat?: string | null
          inicial_dreta_size?: string | null
          inicial_esquerra_reactivitat?: string | null
          inicial_esquerra_size?: string | null
          itp_consciencia?: number | null
          itp_ferides?: number | null
          itp_fractures?: number | null
          itp_pes?: number | null
          itp_tas?: number | null
          itp_via_aeria?: number | null
          killip_class?: number | null
          lesion_markers?: Json | null
          malinas_durada_contraccions?: number | null
          malinas_durada_part?: number | null
          malinas_embarassos?: number | null
          malinas_interval_contraccions?: number | null
          malinas_trencament_bossa?: number | null
          material_seguretat?: string | null
          matricula_vehicle?: string | null
          matricula_vehicle_contrari?: string | null
          mobilitzacions?: string | null
          monitores_rows?: Json | null
          news2_selections?: Json | null
          nivell_consciencia?: string | null
          num_asseguranca?: string | null
          objectes?: string | null
          objectes_personals?: string | null
          observacions?: string | null
          observacions_doble_cobertura?: string | null
          ompliment_capillar?: string | null
          pacient_lloc_assistencia?: string | null
          patrick_score?: number | null
          pell?: string | null
          pols?: string | null
          posicio_pacient_vehicle?: string | null
          race_afa_agn?: number | null
          race_brac?: number | null
          race_cama?: number | null
          race_facial?: number | null
          race_hemicos?: string | null
          race_ocular?: number | null
          rancom_lavabo?: string | null
          rancom_moure?: string | null
          rancom_vestir?: string | null
          rapid_bracos?: string | null
          rapid_cara?: string | null
          rapid_parla?: string | null
          rcp_previa?: string | null
          ref_afectat?: string | null
          ref_cognoms?: string | null
          ref_email?: string | null
          ref_incident?: string | null
          ref_nom?: string | null
          ref_telefon?: string | null
          ref_tes1?: string | null
          ref_tes2?: string | null
          ref_tipus?: string | null
          respiracio?: string | null
          situacio_implicats?: string | null
          timestamp?: string | null
          tipus_doble_cobertura?: string | null
          tipus_trasllat?: string | null
          trasllat?: string | null
          trts_fr?: number | null
          trts_gcs?: number | null
          trts_tas?: number | null
          vehicles_implicats?: string | null
          via_aeria?: string | null
        }
        Update: {
          acr?: string | null
          acr_presenciada?: string | null
          activitat_esportiva?: string | null
          agitat?: string | null
          allergies?: string | null
          alteracio_neurologica?: string | null
          altres_actuants_no_sem?: string | null
          altres_actuants_sem?: string | null
          antecedents?: string | null
          aparell_locomotor_text?: string | null
          apgar_color?: number | null
          apgar_estimuls?: number | null
          apgar_fc?: number | null
          apgar_resp?: number | null
          apgar_to?: number | null
          centro_id?: string | null
          cim_codi1?: string | null
          cim_codi2?: string | null
          cim_codi3?: string | null
          cim_desc1?: string | null
          cim_desc2?: string | null
          cim_desc3?: string | null
          circulacio?: string | null
          codi_gravetat?: string | null
          codi_pre_activacio?: string | null
          companyia_doble_cobertura?: string | null
          cura_topica?: string | null
          data?: string | null
          descripcio_dea?: string | null
          descripcio_fets?: string | null
          doble_cobertura?: string | null
          dolor_toracic?: string | null
          entregat_a?: string | null
          eva_score?: number | null
          evaluated_scales?: Json | null
          existeix_doble_cobertura?: string | null
          final_dreta_reactivitat?: string | null
          final_dreta_size?: string | null
          final_esquerra_reactivitat?: string | null
          final_esquerra_size?: string | null
          finalitzacio_pacient?: string | null
          finalitzacio_unitat?: string | null
          glasgow_lactant?: string | null
          glasgow_motor?: number | null
          glasgow_ocular?: number | null
          glasgow_verbal?: number | null
          habits_toxics?: string | null
          hemostasia?: string | null
          hora?: string | null
          id?: string
          inicial_dreta_reactivitat?: string | null
          inicial_dreta_size?: string | null
          inicial_esquerra_reactivitat?: string | null
          inicial_esquerra_size?: string | null
          itp_consciencia?: number | null
          itp_ferides?: number | null
          itp_fractures?: number | null
          itp_pes?: number | null
          itp_tas?: number | null
          itp_via_aeria?: number | null
          killip_class?: number | null
          lesion_markers?: Json | null
          malinas_durada_contraccions?: number | null
          malinas_durada_part?: number | null
          malinas_embarassos?: number | null
          malinas_interval_contraccions?: number | null
          malinas_trencament_bossa?: number | null
          material_seguretat?: string | null
          matricula_vehicle?: string | null
          matricula_vehicle_contrari?: string | null
          mobilitzacions?: string | null
          monitores_rows?: Json | null
          news2_selections?: Json | null
          nivell_consciencia?: string | null
          num_asseguranca?: string | null
          objectes?: string | null
          objectes_personals?: string | null
          observacions?: string | null
          observacions_doble_cobertura?: string | null
          ompliment_capillar?: string | null
          pacient_lloc_assistencia?: string | null
          patrick_score?: number | null
          pell?: string | null
          pols?: string | null
          posicio_pacient_vehicle?: string | null
          race_afa_agn?: number | null
          race_brac?: number | null
          race_cama?: number | null
          race_facial?: number | null
          race_hemicos?: string | null
          race_ocular?: number | null
          rancom_lavabo?: string | null
          rancom_moure?: string | null
          rancom_vestir?: string | null
          rapid_bracos?: string | null
          rapid_cara?: string | null
          rapid_parla?: string | null
          rcp_previa?: string | null
          ref_afectat?: string | null
          ref_cognoms?: string | null
          ref_email?: string | null
          ref_incident?: string | null
          ref_nom?: string | null
          ref_telefon?: string | null
          ref_tes1?: string | null
          ref_tes2?: string | null
          ref_tipus?: string | null
          respiracio?: string | null
          situacio_implicats?: string | null
          timestamp?: string | null
          tipus_doble_cobertura?: string | null
          tipus_trasllat?: string | null
          trasllat?: string | null
          trts_fr?: number | null
          trts_gcs?: number | null
          trts_tas?: number | null
          vehicles_implicats?: string | null
          via_aeria?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "informe_ref_afectat_fkey"
            columns: ["ref_afectat"]
            isOneToOne: false
            referencedRelation: "afectat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "informe_ref_incident_fkey"
            columns: ["ref_incident"]
            isOneToOne: false
            referencedRelation: "incident"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "informe_ref_tes1_fkey"
            columns: ["ref_tes1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "informe_ref_tes1_fkey"
            columns: ["ref_tes1"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "informe_ref_tes2_fkey"
            columns: ["ref_tes2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "informe_ref_tes2_fkey"
            columns: ["ref_tes2"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["student_id"]
          },
        ]
      }
      monitor_state: {
        Row: {
          defib_energy_selected: number | null
          diastolic_bp: number | null
          ecg_rhythm: string | null
          etco2: number | null
          heart_rate: number | null
          is_bp_connected: boolean | null
          is_capno_connected: boolean
          is_defib_charging: boolean | null
          is_ecg_connected: boolean | null
          is_shock_delivered: boolean | null
          is_sp02_connected: boolean | null
          is_temp_connected: boolean
          respiratory_rate: number | null
          session_id: string
          spo2: number | null
          systolic_bp: number | null
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          defib_energy_selected?: number | null
          diastolic_bp?: number | null
          ecg_rhythm?: string | null
          etco2?: number | null
          heart_rate?: number | null
          is_bp_connected?: boolean | null
          is_capno_connected?: boolean
          is_defib_charging?: boolean | null
          is_ecg_connected?: boolean | null
          is_shock_delivered?: boolean | null
          is_sp02_connected?: boolean | null
          is_temp_connected?: boolean
          respiratory_rate?: number | null
          session_id: string
          spo2?: number | null
          systolic_bp?: number | null
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          defib_energy_selected?: number | null
          diastolic_bp?: number | null
          ecg_rhythm?: string | null
          etco2?: number | null
          heart_rate?: number | null
          is_bp_connected?: boolean | null
          is_capno_connected?: boolean
          is_defib_charging?: boolean | null
          is_ecg_connected?: boolean | null
          is_shock_delivered?: boolean | null
          is_sp02_connected?: boolean | null
          is_temp_connected?: boolean
          respiratory_rate?: number | null
          session_id?: string
          spo2?: number | null
          systolic_bp?: number | null
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitor_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pacient: {
        Row: {
          adreca: string | null
          cip: string | null
          cognoms: string | null
          correu_electronic: string | null
          data_naixement: string | null
          dni: string | null
          edat: string | null
          id: string
          nom: string | null
          passaport: string | null
          ref_centre: string | null
          sexe: string | null
          telefon: string | null
        }
        Insert: {
          adreca?: string | null
          cip?: string | null
          cognoms?: string | null
          correu_electronic?: string | null
          data_naixement?: string | null
          dni?: string | null
          edat?: string | null
          id?: string
          nom?: string | null
          passaport?: string | null
          ref_centre?: string | null
          sexe?: string | null
          telefon?: string | null
        }
        Update: {
          adreca?: string | null
          cip?: string | null
          cognoms?: string | null
          correu_electronic?: string | null
          data_naixement?: string | null
          dni?: string | null
          edat?: string | null
          id?: string
          nom?: string | null
          passaport?: string | null
          ref_centre?: string | null
          sexe?: string | null
          telefon?: string | null
        }
        Relationships: []
      }
      professors: {
        Row: {
          center_id: string
          created_at: string | null
          department: string | null
          employee_number: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          center_id: string
          created_at?: string | null
          department?: string | null
          employee_number?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          center_id?: string
          created_at?: string | null
          department?: string | null
          employee_number?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professors_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professors_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["center_id"]
          },
          {
            foreignKeyName: "professors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "student_profiles"
            referencedColumns: ["student_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          institution: string | null
          lang: Database["public"]["Enums"]["Languages"]
          professional_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          institution?: string | null
          lang?: Database["public"]["Enums"]["Languages"]
          professional_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          lang?: Database["public"]["Enums"]["Languages"]
          professional_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      recurs: {
        Row: {
          centro_id: string | null
          codi_recurs: string
          id: string
        }
        Insert: {
          centro_id?: string | null
          codi_recurs: string
          id?: string
        }
        Update: {
          centro_id?: string | null
          codi_recurs?: string
          id?: string
        }
        Relationships: []
      }
      scenario_states: {
        Row: {
          diastolic_bp: number | null
          ecg_rhythm: string | null
          etco2: number | null
          heart_rate: number | null
          id: string
          order_index: number
          respiratory_rate: number | null
          scenario_id: string
          spo2: number | null
          state_name: string
          systolic_bp: number | null
          temperature: number
        }
        Insert: {
          diastolic_bp?: number | null
          ecg_rhythm?: string | null
          etco2?: number | null
          heart_rate?: number | null
          id?: string
          order_index?: number
          respiratory_rate?: number | null
          scenario_id: string
          spo2?: number | null
          state_name: string
          systolic_bp?: number | null
          temperature?: number
        }
        Update: {
          diastolic_bp?: number | null
          ecg_rhythm?: string | null
          etco2?: number | null
          heart_rate?: number | null
          id?: string
          order_index?: number
          respiratory_rate?: number | null
          scenario_id?: string
          spo2?: number | null
          state_name?: string
          systolic_bp?: number | null
          temperature?: number
        }
        Relationships: [
          {
            foreignKeyName: "scenario_states_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          instructor_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          instructor_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          instructor_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenarios_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["student_id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          id: string
          instructor_id: string
          is_active: boolean | null
          scenario_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instructor_id: string
          is_active?: boolean | null
          scenario_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instructor_id?: string
          is_active?: boolean | null
          scenario_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["student_id"]
          },
        ]
      }
      students: {
        Row: {
          center_id: string
          course_group: string | null
          created_at: string | null
          department: string | null
          id: string
          student_code: string | null
          updated_at: string | null
        }
        Insert: {
          center_id: string
          course_group?: string | null
          created_at?: string | null
          department?: string | null
          id: string
          student_code?: string | null
          updated_at?: string | null
        }
        Update: {
          center_id?: string
          course_group?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          student_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["center_id"]
          },
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "student_profiles"
            referencedColumns: ["student_id"]
          },
        ]
      }
    }
    Views: {
      student_profiles: {
        Row: {
          center_id: string | null
          center_name: string | null
          course_group: string | null
          created_at: string | null
          department: string | null
          lang: Database["public"]["Enums"]["Languages"] | null
          student_code: string | null
          student_email: string | null
          student_id: string | null
          student_name: string | null
          study_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centers_id_fkey"
            columns: ["center_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centers_id_fkey"
            columns: ["center_id"]
            isOneToOne: true
            referencedRelation: "student_profiles"
            referencedColumns: ["student_id"]
          },
        ]
      }
    }
    Functions: {
      get_user_centro: { Args: never; Returns: string }
      get_user_rol: { Args: never; Returns: string }
    }
    Enums: {
      languages: "es" | "en" | "pt" | "fr"
      Languages: "es" | "en" | "cat"
      user_role: "centro" | "alumno" | "admin" | "profesor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      languages: ["es", "en", "pt", "fr"],
      Languages: ["es", "en", "cat"],
      user_role: ["centro", "alumno", "admin", "profesor"],
    },
  },
} as const
