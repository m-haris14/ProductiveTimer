import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Pomodoro from './component/Pomodoro/pomodoro'
import Signup from './View/Pages/Signup'
import Login from './View/Pages/Login'

function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Pomodoro />}/>
      <Route path='/signup' element={<Signup />}/>
      <Route path='/login' element={<Login/>}/>
    </Routes>
    </BrowserRouter>
      
    </>
  )
}

export default App
