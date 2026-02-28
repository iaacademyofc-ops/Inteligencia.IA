
import { supabase } from '../lib/supabase.ts';
import { Player, Staff, Match, TeamDocument, TeamTheme, TeamGender, Modality } from '../types.ts';

export const supabaseService = {
  // Teams
  async getTeam() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .single();
    return { data, error };
  },

  async updateTeam(team: Partial<TeamTheme>) {
    const { data, error } = await supabase
      .from('teams')
      .update(team)
      .eq('id', team.id);
    return { data, error };
  },

  // Players
  async getPlayers() {
    const { data, error } = await supabase
      .from('players')
      .select('*');
    return { data, error };
  },

  async addPlayer(player: Omit<Player, 'id'>) {
    const { data, error } = await supabase
      .from('players')
      .insert([player])
      .select()
      .single();
    return { data, error };
  },

  // Staff
  async getStaff() {
    const { data, error } = await supabase
      .from('staff')
      .select('*');
    return { data, error };
  },

  async addStaff(member: Omit<Staff, 'id'>) {
    const { data, error } = await supabase
      .from('staff')
      .insert([member])
      .select()
      .single();
    return { data, error };
  },

  // Matches
  async getMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select('*');
    return { data, error };
  },

  async addMatch(match: Omit<Match, 'id'>) {
    const { data, error } = await supabase
      .from('matches')
      .insert([match])
      .select()
      .single();
    return { data, error };
  },

  // Documents
  async getDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*');
    return { data, error };
  },

  async addDocument(ownerId: string, ownerType: 'Atleta' | 'Comissão', doc: Omit<TeamDocument, 'id'>) {
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        owner_id: ownerId,
        owner_type: ownerType,
        type: doc.type,
        status: doc.status,
        issue_date: doc.issueDate,
        document_number: doc.documentNumber
      }])
      .select()
      .single();
    return { data, error };
  },

  async updateDocumentStatus(docId: string, status: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({ status })
      .eq('id', docId);
    return { data, error };
  }
};
