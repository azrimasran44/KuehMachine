// Score/wallet persistence through the shared kuehmachine.com account
// system (see DATABASE.md / window.KuehAccount from account-widget.js).
// Every call here is best-effort: a signed-out player, a missing table
// (before Leonard runs database.sql), or a network hiccup should never
// block or break gameplay — localStorage is always the source of truth
// that the game itself reads from; Supabase is a sync layer on top.

const LOCAL_KEY = 'kueh-hdb-panic-high-score';
const TABLE = 'kueh_hdb_panic_progress';

function peekLocalHighScore() {
  const v = parseInt(localStorage.getItem(LOCAL_KEY) || '0', 10);
  return Number.isFinite(v) ? v : 0;
}

function saveLocalHighScore(score) {
  try {
    localStorage.setItem(LOCAL_KEY, String(score));
  } catch (_) {
    // Storage disabled/full — local score just won't persist across reloads.
  }
}

// Generic read of the whole per-user data blob — exported so other
// modules (js/wallet.js) can share the same remote round-trip instead of
// each rolling their own client/table lookup.
export async function fetchRemoteData() {
  try {
    if (!window.KuehAccount) return null;
    await window.KuehAccount.ready;
    const user = window.KuehAccount.getUser();
    if (!user) return null;
    const client = window.KuehAccount.getClient();
    if (!client) return null;

    const { data, error } = await client
      .from(TABLE)
      .select('data')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('[progress] remote fetch failed:', error.message);
      return null;
    }
    return data?.data ?? null;
  } catch (err) {
    console.warn('[progress] remote fetch failed:', err);
    return null;
  }
}

// Generic write that MERGES `partial` into whatever's already in the
// remote blob rather than replacing it outright — the `data` column
// holds every field this project persists (high_score, coins,
// unlocked_characters, selected_character, ...) in one row per user, so
// a naive overwrite here would silently erase whichever of those fields
// the caller didn't happen to pass.
export async function pushRemoteData(partial) {
  try {
    if (!window.KuehAccount) return;
    await window.KuehAccount.ready;
    const user = window.KuehAccount.getUser();
    if (!user) return;
    const client = window.KuehAccount.getClient();
    if (!client) return;

    const existing = (await fetchRemoteData()) || {};
    const merged = { ...existing, ...partial };

    const { error } = await client.from(TABLE).upsert({
      user_id: user.id,
      data: merged,
      updated_at: new Date().toISOString(),
    });
    if (error) console.warn('[progress] remote save failed, kept locally only:', error.message);
  } catch (err) {
    console.warn('[progress] remote save failed, kept locally only:', err);
  }
}

export function isSignedIn() {
  return !!(window.KuehAccount && window.KuehAccount.getUser());
}

export function getLocalHighScoreSync() {
  return peekLocalHighScore();
}

export async function getHighScore() {
  const local = peekLocalHighScore();
  const remote = await fetchRemoteData();
  const remoteScore = remote?.high_score ?? null;
  if (remoteScore != null && remoteScore > local) {
    saveLocalHighScore(remoteScore);
    return remoteScore;
  }
  return local;
}

export async function reportScore(score) {
  const current = peekLocalHighScore();
  if (score > current) {
    saveLocalHighScore(score);
    pushRemoteData({ high_score: score, last_played: new Date().toISOString() });
    return score;
  }
  return current;
}
