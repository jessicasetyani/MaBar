import Parse from '../services/back4app'

export async function testBack4AppConnection() {
  try {
    const TestObject = Parse.Object.extend('TestConnection')
    const testObject = new TestObject()
    testObject.set('test', true)
    await testObject.save()
    await testObject.destroy()
    return { success: true, message: 'Back4App connection successful' }
  } catch (error) {
    return { success: false, message: (error as Error).message }
  }
}