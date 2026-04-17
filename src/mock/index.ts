import Mock from 'mockjs'
import { setupUserMock } from './user'
import { setupRoleMock } from './role'
import { setupDepartmentMock } from './department'
import { setupAuthMock } from './auth'
import { setupOrderMock } from './order'
import { setupCustomerMock } from './customer'
import { setupTrialMock } from './trial'
import { setupProductMock } from './product'
import { setupMessageMock } from './message'
import { setupLogMock } from './log'
import { setupApprovalMock } from './approval'

export function setupMock() {
  Mock.setup({
    timeout: '200-600'
  })
  
  setupUserMock()
  setupRoleMock()
  setupDepartmentMock()
  setupAuthMock()
  setupOrderMock()
  setupCustomerMock()
  setupTrialMock()
  setupProductMock()
  setupMessageMock()
  setupLogMock()
  setupApprovalMock()
}

export { Mock }
