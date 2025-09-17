import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const Welcome = () => {

 const conext =  process.env.NEXT_PUBLIC_API_URL
  return (
    <><div>Welcome</div>
<h1>{conext}</h1>

    <Link href={"/dashboard"}>
    <Button>Dashboard</Button>
    </Link>

     <Link href={"/login"}>
    <Button>Login</Button>
    </Link>

    </>
  )
}

export default Welcome