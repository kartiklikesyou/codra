"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Signin (){

    
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    async function signin(){
        if (!email || !password) {
            alert("Email and password are required");
        return;
        }

        try{
            const response = await fetch("http://localhost:8080/signin",{
                method:"POST",
                headers:{
                    "content-type":"application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })
            const data = await response.json

            if (!response.ok) {
            alert(data.error);
            return;
            }

            alert("SignIn Successful")
            router.push("/")
            console.log(data)
        }catch(e){
            console.log(e)
            alert("something went wrong")
        }
    }


    return <div className="flex justify-center items-center min-h-screen">
        <Card className="w-lg flex items-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            Email
            <Input type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}></Input>
            Password
            <Input type="password"
            placeholder="password"
            value={password}
            onChange={(e)=> setPassword(e.target.value)}></Input>
            <Button onClick={signin}>Sign In</Button>
            <Button onClick={() => signIn("google")}>
                Continue with Google
            </Button>
            <Button onClick={() => signIn("github")}>
                Continue with GitHub
            </Button>
        </Card>
    </div>
}
