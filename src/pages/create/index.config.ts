export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '麻将约局' })
  : { navigationBarTitleText: '麻将约局' }
