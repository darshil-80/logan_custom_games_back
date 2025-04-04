import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'

export const getSecretValue = async (secretName = 'FIREBLOCKS_SECRET_KEY') => {
  const client = new SecretsManagerClient()
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName
    })
  )
  if (response.SecretString) {
    return response.SecretString
  }

  if (response.SecretBinary) {
    const buff = Buffer.from(response.SecretBinary, 'base64')
    return JSON.parse(buff.toString('ascii'))
  }
}
