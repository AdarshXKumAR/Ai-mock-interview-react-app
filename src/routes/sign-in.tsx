import { SignIn } from "@clerk/clerk-react";

export const SignInPage = () => {
  return (
    <div>
        <section className="min-h-screen flex items-stretch text-white ">
            <div className="lg:flex w-1/2 hidden bg-gray-500 bg-no-repeat bg-cover relative items-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80)'}}>
                <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
                <div className="w-full px-24 z-10">
                    <h1 className="text-5xl font-bold text-left tracking-wide">Ace Your Next Interview with AI</h1>
                    <p className="text-3xl mt-8 mb-4">Practice mock interviews, get feedback, and boost your confidence.</p>
                </div>
            </div>
            
            <div className="lg:w-1/2 w-full flex items-center justify-center z-0 min-h-screen bg-gradient-to-br from-gray-900 to-black">
                <div className="absolute lg:hidden z-10 inset-0 bg-gray-500 bg-no-repeat bg-cover items-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80)'}}>
                    <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
                </div>
                <div className="w-full max-w-md z-20 px-4">
                        <SignIn path="/signin" />
                </div>
            </div>
        </section>
    </div>
  );
};
