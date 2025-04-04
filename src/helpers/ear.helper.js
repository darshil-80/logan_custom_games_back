export default function getBasicAuth (basicUsername, basicPassword) {
  try {
    return `Basic ${Buffer.from(`${basicUsername}:${basicPassword}`).toString('base64')}`
  } catch (err) {
    throw new Error('There is an error creating basic authentication.')
  }
}
