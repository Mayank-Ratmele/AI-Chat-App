import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Project = () => {

	const loc = useLocation();
	// console.log(loc.state);

	const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

	return (
		<main className="h-screen w-screen flex">
			<section className="left relative flex flex-col h-full w-md bg-gray-200">
				<header className="flex justify-end p-3 px-4 w-full bg-slate-100">
					<button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2 cursor-pointer">
						<i className="ri-team-fill"></i>
					</button>
				</header>

				<div className="conversation-area flex flex-col flex-grow">
					<div className="message-box flex-grow flex flex-col p-4 gap-1.5">
						<div className="incoming message max-w-80 flex flex-col p-2 bg-slate-50 w-fit rounded-md">
							<small className="opacity-60 text-xs">example@test.com</small>
							 <p className="text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde, magni ab neque ducimus, placeat blanditiis nesciunt, accusantium quasi non hic eos voluptates cumque omnis dolorem explicabo reprehenderit tenetur nostrum culpa?</p> 
						</div>
						<div className="ml-auto max-w-80 message flex flex-col p-2 bg-slate-50 w-fit rounded-md">
							<small className="opacity-60 text-xs">example@test.com</small>
							 <p className="text-sm">hello</p> 
						</div>
					</div>
					<div className="inputField w-full flex p-3">
						<input style={{ backgroundColor: 'rgba(255, 255, 255, 0.35)' }} className="py-2 pl-2 w-full border-none outline-none" type="text" placeholder="Enter message" />
						<button className="cursor-pointer flex-grow ml-3 mr-3 px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500">
							<i className="ri-send-plane-fill"></i>
						</button>
					</div>
				</div>

				<div className={`sidePanel w-64 h-96 flex flex-col gap-2 bg-blue-200 absolute transition-all ${isSidePanelOpen?'translate-x-0' : '-translate-x-full'} top-0`}>
					<header className="flex justify-end p-2 px-3 bg-slate-200 ">
						<button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2 cursor-pointer">
							<i className="ri-close-fill"></i>
						</button>
					</header>

					<div className="users flex flex-col gap-2 px-1">
						<div className="user cursor-pointer hover:bg-slate-100 flex gap-2 items-center">
							<div className="aspect-square rounded-full w-fit h-fit flex p-5 items-center justify-center bg-gray-200">
								<i class="ri-user-4-line absolute"></i>
							</div>

							<h1 className="font-semibold text-lg">username</h1>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}

export default Project;