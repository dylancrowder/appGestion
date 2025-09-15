import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const Welcome = () => {
  return (
    <><div>Welcome</div>
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