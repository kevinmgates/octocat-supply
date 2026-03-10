param environmentName string
param appName string
param acrName string
param imageTag string
param acrResourceGroup string = resourceGroup().name

var location = resourceGroup().location
var uniqueSuffix = uniqueString(resourceGroup().id)
var apiAppName = '${appName}-api-${uniqueSuffix}'
var frontendAppName = '${appName}-frontend-${uniqueSuffix}'
var apiFqdn = '${apiAppName}.azurewebsites.net'
var frontendFqdn = '${frontendAppName}.azurewebsites.net'
var acrLoginServer = '${acrName}.azurecr.io'
var acrResourceId = resourceId(acrResourceGroup, 'Microsoft.ContainerRegistry/registries', acrName)

module logAnalytics './modules/logAnalytics.bicep' = {
  name: 'logAnalytics'
  params: {
    name: '${appName}-logs-${uniqueSuffix}'
    location: location
  }
}

module webapps './modules/webapps.bicep' = {
  name: 'webapps'
  params: {
    location: location
    apiAppName: apiAppName
    frontendAppName: frontendAppName
    acrName: acrName
    acrLoginServer: acrLoginServer
    acrResourceId: acrResourceId
    acrResourceGroup: acrResourceGroup
    imageTag: imageTag
    apiFqdn: apiFqdn
    frontendFqdn: frontendFqdn
    logAnalyticsWorkspaceId: logAnalytics.outputs.workspaceId
  }
}

output apiUrl string = 'https://${apiFqdn}'
output frontendUrl string = 'https://${frontendFqdn}'
