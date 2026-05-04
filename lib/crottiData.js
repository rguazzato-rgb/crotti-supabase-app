import { supabase } from '@/lib/supabaseClient';

export function computeKpi(jobs = []) {
  const today = new Date();

  return {
    total: jobs.length,
    pending: jobs.filter((job) => job.status === 'pending').length,
    inProgress: jobs.filter((job) => job.status === 'in_progress').length,
    completed: jobs.filter((job) => job.status === 'completed').length,
    overdue: jobs.filter((job) => {
      return job.status !== 'completed' && job.scheduled_date && new Date(job.scheduled_date) < today;
    }).length,
  };
}

export async function getUsers() {
  const profiles = await supabase.from('profiles').select('id,email,role,created_at').order('created_at', { ascending: false });

  if (!profiles.error) return profiles;

  return supabase.from('users').select('id,email,created_at').order('created_at', { ascending: false });
}

function isMissingTable(error) {
  return error?.code === '42P01' || error?.code === 'PGRST205' || error?.message?.toLowerCase().includes('activities');
}

function activityToJob(activity) {
  const startAt = activity.start_at || activity.created_at;

  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    status: activity.status,
    priority: activity.priority,
    scheduled_date: activity.scheduled_date || startAt?.slice(0, 10) || null,
    client_id: activity.assigned_user_id,
    created_at: activity.created_at,
  };
}

export async function getJobs() {
  const activities = await supabase.from('activities').select('*').order('start_at', { ascending: true });

  if (!activities.error) {
    return {
      data: (activities.data || []).map(activityToJob),
      error: null,
    };
  }

  if (!isMissingTable(activities.error)) return activities;

  return supabase.from('jobs').select('*').order('scheduled_date', { ascending: true });
}

export async function getEvents() {
  const activities = await supabase.from('activities').select('*').order('start_at', { ascending: true });

  if (!activities.error) return activities;
  if (!isMissingTable(activities.error)) return activities;

  return supabase.from('events').select('*').order('start_at', { ascending: true });
}

export async function createAdminIntervention(payload) {
  const startAt = payload.start_at ? new Date(payload.start_at).toISOString() : null;
  const endAt = payload.end_at
    ? new Date(payload.end_at).toISOString()
    : startAt
      ? new Date(new Date(startAt).getTime() + 60 * 60 * 1000).toISOString()
      : null;
  const scheduledDate = startAt ? startAt.slice(0, 10) : null;

  const activityResult = await supabase
    .from('activities')
    .insert([
      {
        assigned_user_id: payload.user_id,
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        status: payload.status,
        start_at: startAt,
        end_at: endAt,
        scheduled_date: scheduledDate,
        location: payload.location,
        technician: payload.technician || 'Crotti Safety',
        created_by: payload.created_by || null,
      },
    ])
    .select()
    .single();

  if (!activityResult.error) {
    return {
      data: {
        job: activityToJob(activityResult.data),
        event: activityResult.data,
      },
      error: null,
    };
  }

  if (!isMissingTable(activityResult.error)) return { data: null, error: activityResult.error };

  const jobResult = await supabase
    .from('jobs')
    .insert([
      {
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        status: payload.status,
        scheduled_date: scheduledDate,
        client_id: payload.user_id,
      },
    ])
    .select()
    .single();

  if (jobResult.error) return { data: null, error: jobResult.error };

  /* FIX: nel fallback events, created_by deve essere l'utente assegnato,
     non l'admin, altrimenti la RLS impedisce all'utente di vedere l'evento */
  const eventResult = await supabase
    .from('events')
    .insert([
      {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        start_at: startAt,
        end_at: endAt,
        location: payload.location,
        created_by: payload.user_id,
      },
    ])
    .select()
    .single();

  if (eventResult.error) return { data: { job: jobResult.data }, error: eventResult.error };

  return {
    data: {
      job: jobResult.data,
      event: eventResult.data,
    },
    error: null,
  };
}

export async function createServiceRequest(payload) {
  return supabase
    .from('service_requests')
    .insert([payload])
    .select()
    .single();
}

export async function getDocuments() {
  return supabase.from('documents').select('*').order('created_at', { ascending: false });
}

export async function getFireExtinguishers() {
  return supabase.from('fire_extinguishers').select('*').order('location', { ascending: true });
}
