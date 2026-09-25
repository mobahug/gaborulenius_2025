/**
 * Beats of the portal ("The Eye") as fractions of its pinned scroll range.
 * Shared by the portal chapter and the stage director so the jungle video,
 * the wing wipe and the shader all agree on timing.
 */
export const PORTAL_BEATS = {
  /** The bird emerges from the light shaft. */
  appear: [0.0, 0.06],
  /** It flies toward the camera, growing. */
  approach: [0.02, 0.4],
  /** Its near wing sweeps across the lens; the jungle turns strange behind it. */
  pass: [0.366, 0.53],
  /** The bird's head in close-up, looking back. */
  head: [0.42, 0.66],
  /** The glowing jungle edges dissolve into neural filaments. */
  neural: [0.62, 0.9],
  /** The camera dollies into the eye. */
  eye: [0.56, 1.0],
  /** The pupil constricts, then dilates. */
  pupil: [0.52, 0.97],
  /** Through the pupil. */
  tunnel: [0.82, 1.0],
  /** The question appears inside. */
  question: [0.86, 0.98],
} as const;
