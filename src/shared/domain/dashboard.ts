export interface StatusTotal {
  count: number
  amountCentavos: number
}

export interface DashboardSummary {
  pendingApproval: StatusTotal
  approved: StatusTotal              
  forLiquidation: StatusTotal        
  completed: StatusTotal & { liquidatedCentavos: number }
  totalReleasedCentavos: number      
  reimbursementOwed: StatusTotal     
  refundDue: StatusTotal            
}