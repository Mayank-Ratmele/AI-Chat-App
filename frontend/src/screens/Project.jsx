import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';

const Project = () => {
	const loc = useLocation();

	const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
	const [isUserModalOpen, setIsUserModalOpen] = useState(false);

	// Multi-select
	const [selectedUserIds, setSelectedUserIds] = useState(new Set());
	const [searchQuery, setSearchQuery] = useState('');

	const [users, setUsers] = useState([]);
	const [project, setProject] = useState(loc.state.project);

	// --- Helpers ---
	const toStr = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));
	const lower = (v) => toStr(v).toLowerCase();

	function addCollaborators() {
		axios.put('/projects/add-user', { 
			projectId: loc.state.project._id,
			users: Array.from(selectedUserIds)
		}).then(res => {
			console.log(res.data);
			setIsUserModalOpen(false);
		}).catch(err => {
			console.log(err);
			setIsUserModalOpen(false);
		})
	}

	useEffect(() => {

		axios.get(`/projects/get-project/${loc.state.project._id}`).then(res => {
			setProject(res.data.project);
		}).catch(err => {
			console.log(err);
		})

		axios
		.get('/users/all')
		.then((res) => {
			const raw = res?.data?.users;
			const list = Array.isArray(raw) ? raw : [];
			// Normalize user objects to avoid undefined fields later
			const normalized = list.map((u) => {
			const id =
				u?._id ?? u?.id ?? u?.uuid ?? u?.email ?? cryptoRandomId();
			const nameCandidate =
				u?.name ??
				u?.username ??
				[u?.firstName, u?.lastName].filter(Boolean).join(' ') ??
				'';
			const email = toStr(u?.email);
			const name = nameCandidate || (email ? email.split('@')[0] : 'Unknown');
			return { _id: id, name: toStr(name), email };
			});
			setUsers(normalized);
		})
		.catch((err) => {
			console.log(err);
			setUsers([]); // keep it safe
		});
	}, []);

	// Fallback random id if backend gives none
	function cryptoRandomId() {
		// not cryptographically secure, just unique enough for UI keys
		return 'u_' + Math.random().toString(36).slice(2, 10);
	}

	const filteredUsers = useMemo(() => {
		if (!Array.isArray(users)) return [];
		const q = lower(searchQuery).trim();
		if (!q) return users;
		return users.filter((u) => {
		// Safely compare without throwing
		return lower(u?.name).includes(q) || lower(u?.email).includes(q);
		});
	}, [users, searchQuery]);

	const toggleSelectUser = useCallback((id) => {
		setSelectedUserIds((prev) => {
		const next = new Set(prev);
		next.has(id) ? next.delete(id) : next.add(id);
		return next;
		});
	}, []);

	const deselectAll = useCallback(() => {
		setSelectedUserIds(new Set());
	}, []);

	const handleAddSelected = useCallback(() => {
		const ids = Array.from(selectedUserIds);
		// TODO: send `ids` to your API, e.g.:
		console.log('Added users:', ids);
		setIsUserModalOpen(false);
	}, [selectedUserIds]);

	const selectedCount = selectedUserIds.size;

	return (
		<main className="h-screen w-screen flex">
		<section className="left relative flex flex-col h-full w-md bg-gray-200">
			{/* Header */}
			<header className="flex justify-between items-center p-3 px-4 w-full bg-slate-100">
			<button
				className="p-2 cursor-pointer flex gap-2 items-center"
				onClick={() => setIsUserModalOpen(true)}
			>
				<i className="ri-user-add-fill"></i>
				<p className="text-sm sm:text-base">Add Collaborators</p>
			</button>

			<button
				onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
				className="p-2 cursor-pointer"
			>
				<i className="ri-team-fill"></i>
			</button>
			</header>

			{/* Conversation area */}
			<div className="conversation-area flex flex-col flex-grow">
			<div className="message-box flex-grow flex flex-col p-4 gap-1.5 overflow-y-auto">
				<div className="incoming message max-w-80 flex flex-col p-2 bg-slate-50 w-fit rounded-md">
				<small className="opacity-60 text-xs">example@test.com</small>
				<p className="text-sm">
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde, magni ab neque ducimus, placeat blanditiis nesciunt, accusantium quasi non hic eos voluptates cumque omnis dolorem explicabo reprehenderit tenetur nostrum culpa?
				</p>
				</div>
				<div className="ml-auto max-w-80 message flex flex-col p-2 bg-slate-50 w-fit rounded-md">
				<small className="opacity-60 text-xs">example@test.com</small>
				<p className="text-sm">hello</p>
				</div>

				{selectedCount > 0 && (
				<div className="mt-3 text-xs text-slate-600">
					Selected user ids:{' '}
					<span className="font-semibold">
					{Array.from(selectedUserIds).join(', ')}
					</span>
				</div>
				)}
			</div>

			{/* Input pinned to bottom */}
			<div className="inputField w-full flex p-3 bg-slate-100">
				<input
				style={{ backgroundColor: 'rgba(255, 255, 255, 0.35)' }}
				className="py-2 pl-2 w-full border rounded-md outline-none"
				type="text"
				placeholder="Enter message"
				/>
				<button className="cursor-pointer ml-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
				<i className="ri-send-plane-fill"></i>
				</button>
			</div>
			</div>

			{/* Slide-in side panel */}
			<div
			className={`sidePanel w-full h-full flex flex-col gap-2 bg-blue-100 absolute transition-transform duration-300 ease-out ${
				isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'
			} top-0`}
			>
			<header className="flex justify-between items-center p-2 px-3 bg-slate-200">
				<h1> <strong>Collaborators:</strong></h1>
				<button
				onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
				className="p-2 cursor-pointer"
				>
				<i className="ri-close-fill"></i>
				</button>
			</header>

			<div className="users flex flex-col gap-2 px-2 pb-4 overflow-y-auto">
				{project.users && project.users.map(user => {
					return (<div className="user cursor-pointer hover:bg-slate-100 flex gap-3 items-center p-2 rounded-md">
						<div className="relative rounded-full w-10 h-10 flex items-center justify-center bg-gray-200">
							<i className="ri-user-4-line text-lg"></i>
						</div>
						<h1 className="font-semibold text-base sm:text-lg">{user.email}</h1>
						</div>)
				})}
			</div>
			</div>
		</section>

		{/* Users Modal */}
		{isUserModalOpen && (
			<div
			className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
			aria-modal="true"
			role="dialog"
			>
			{/* Click outside to close */}
			<div
				className="absolute inset-0"
				onClick={() => setIsUserModalOpen(false)}
			/>
			<div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-lg p-4 sm:p-6 max-h-[85vh] overflow-hidden flex flex-col">
				<div className="flex items-center justify-between mb-3">
				<h2 className="text-lg sm:text-xl font-semibold">Add Collaborators</h2>
				<button
					className="p-2 rounded-md hover:bg-slate-100"
					onClick={() => setIsUserModalOpen(false)}
					aria-label="Close"
				>
					<i className="ri-close-line text-xl"></i>
				</button>
				</div>

				{/* Search */}
				<div className="mb-3 flex gap-2">
				<input
					className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Search users…"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				{searchQuery && (
					<button
					className="px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
					onClick={() => setSearchQuery('')}
					title="Clear search"
					>
					<i className="ri-close-circle-line"></i>
					</button>
				)}
				</div>

				{/* Users list */}
				<div className="overflow-y-auto flex-1 pr-1">
				{filteredUsers.length === 0 ? (
					<div className="text-sm text-slate-500 p-3">No users found.</div>
				) : (
					<ul className="divide-y divide-slate-200">
					{filteredUsers.map((u) => {
						const isSelected = selectedUserIds.has(u._id);
						return (
						<li key={u._id}>
							<button
							onClick={() => toggleSelectUser(u._id)}
							className={`w-full text-left flex items-center gap-3 p-3 hover:bg-slate-50 focus:outline-none rounded-md ${
								isSelected ? 'bg-blue-50 ring-1 ring-blue-400' : ''
							}`}
							>
							<div className="relative rounded-full w-10 h-10 flex items-center justify-center bg-gray-200 shrink-0">
								<i className="ri-user-3-line text-lg"></i>
							</div>
							<div className="min-w-0 flex-1">
								<p className="font-medium truncate">{u.name}</p>
								<p className="text-xs text-slate-600 truncate">{u.email}</p>
							</div>
							<div
								className={`w-5 h-5 rounded border flex items-center justify-center ${
								isSelected
									? 'border-blue-500 bg-blue-500 text-white'
									: 'border-slate-300 bg-white'
								}`}
							>
								{isSelected && (
								<i className="ri-check-line text-sm leading-none" />
								)}
							</div>
							</button>
						</li>
						);
					})}
					</ul>
				)}
				</div>

				{/* Selected summary */}
				<div className="mt-3 flex items-center justify-between text-sm">
				<span className="text-slate-600">{selectedCount} selected</span>
				{selectedCount > 0 && (
					<div className="hidden sm:flex gap-2 flex-wrap max-w-[65%]">
					{Array.from(selectedUserIds).map((id) => {
						const u = users.find((x) => x._id === id);
						if (!u) return null;
						return (
						<span
							key={id}
							className="px-2 py-1 rounded-full bg-slate-100 text-slate-700"
						>
							{u.name}
						</span>
						);
					})}
					</div>
				)}
				</div>

				{/* Actions */}
				<div className="mt-4 flex flex-wrap items-center justify-end gap-2">
				<button
					className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
					onClick={() => setIsUserModalOpen(false)}
				>
					Cancel
				</button>

				<button
					className="px-4 py-2 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
					disabled={selectedCount === 0}
					onClick={deselectAll}
				>
					Clear Selection
				</button>

				<button
					className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
					disabled={selectedCount === 0}
					onClick={addCollaborators}
				>
					Add Selected ({selectedCount})
				</button>
				</div>
			</div>
			</div>
		)}
		</main>
	);
};

export default Project;

