import { createBrowserRouter } from 'react-router-dom'
import MainLayout from './Layout/MainLayout'
import Dashboard from './Pages/Dashboard'
import LostItems from './Pages/LostItems'
import FoundItems from './Pages/FoundItems'
import ItemDetails from './Pages/ItemDetails'
import Profile from './Pages/Profile'
import CreateListing from './Pages/CreateListing'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Dashboard />
      },
      {
        path: '/dashboard',
        element: <Dashboard />
      },
      {
        path: '/lost-items',
        element: <LostItems />
      },
      {
        path: '/found-items',
        element: <FoundItems />
      },
      {
        path: '/item/:id',
        element: <ItemDetails />
      },
      {
        path: '/profile',
        element: <Profile />
      },
      {
        path: '/create-listing',
        element: <CreateListing />
      }
    ]
  }
])