import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Pomodoro from './component/Pomodoro/pomodoro'
import Dashboard from './View/Pages/Dashboard/Dashboard'
import Login from './View/Pages/Login/Login'
import Layout from './View/Layout/Layout'
import Task from './View/Pages/Task/Task'
import Reports from './View/Pages/Report/Reports'
import Attendence from './View/Pages/Attendence/Attendence'
import Settings from './View/Pages/Setting/Settings'


function App() {
  return (
    <>
    <BrowserRouter>
    <Layout>
    <Routes>
      <Route path='/' element={<Pomodoro />}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/dashboard' element={<Dashboard />}/>
      <Route path='/tasks' element={<Task/>}/>
      <Route path='/reports' element={<Reports/>}/>
      <Route path='settings' element={<Settings/>}/>
      <Route path='/attendence' element={<Attendence/>}/>
    </Routes>
    </Layout>
    </BrowserRouter>
      
    </>
  )
}

export default App
