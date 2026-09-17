import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req : NextRequest){
    const token = await getToken({
        req,
        secret : process.env.NEXTAUTH_SECRET
    })

    const {pathname} = req.nextUrl

    const isAuthPage = pathname.startsWith("/signin") || pathname.startsWith("/signup")
    const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/project") || pathname.startsWith("/projects") || pathname.startsWith("/settings") 

    if (!token && isProtectedPage){
        const signinUrl = new URL("/signin", req.url)
        signinUrl.searchParams.set("callbackUrl",pathname)
        return NextResponse.redirect(signinUrl)
    }

    if (token && isAuthPage){
        const dashboardUrl = new URL("/dashboard",req.url)
        return NextResponse.redirect(dashboardUrl)
    }

    return NextResponse.next()
}   

export const config = {
    matcher : [
        "/dashboard/:path*",
        "/project/:path*",
        "/projects/:path*",
        "/settings/:path*",
        "/signin",
        "/signup"
    ]
}