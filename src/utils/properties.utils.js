export const REGISTERED_USER_LIMIT_PROPERTY = 'REGISTERED_USER_LIMIT'
export const REGISTERED_USER_LIMIT_FILTER_PROPERTY = 'REGISTERED_USER_LIMIT_FILTER'

export function convertProperty (property) {
  const simpleProperty = {
    key: property.key,
    value: property.value
  }

  switch (property.type) {
    case 'INT':
      simpleProperty.value = parseInt(simpleProperty.value, 10)
      break
    case 'ARRAY':
      simpleProperty.value = JSON.parse(simpleProperty.value)
      break
    default:
      break
  }

  return simpleProperty
}
