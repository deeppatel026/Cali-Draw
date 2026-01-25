"use client"

export function AuthPage({ isSignin }: {
    isSignin: boolean
}) {

    return <div className="w-screen h-screen flex justify-center items-center">
        <div className="p-2 m-2 bg-white rounded">
            <div className="p-2">
                <input type="text" placeholder="Email"></input>
            </div>
            <div className="p-2">
                <input type="text" placeholder="Password"></input>
            </div>

            <div className="pt-2">
                <button onClick={() => {

                }}>{isSignin ? "Sign In" : "Sign Up"}</button>
            </div>

        </div>
    </div>
}