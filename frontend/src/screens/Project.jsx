// import React, {
// 	useState,
// 	useMemo,
// 	useCallback,
// 	useEffect,
// 	useContext,
// 	useRef,
// 	} from 'react';
// import { useLocation } from 'react-router-dom';
// import Markdown from 'markdown-to-jsx';
// import axios from '../config/axios.js';
// import { initializeSocket, receiveMessage, sendMessage } from '../config/socket.js';
// import { UserContext } from '../context/user.context.jsx';
	
// // Syntax highlighting for AI code blocks
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
	
// // Reusable Markdown renderer so AI messages get VS Code-like code highlighting
// function CodeBlock({ className, children }) {
// 	const languageMatch = /language-(\w+)/.exec(className || '');
// 	const language = languageMatch ? languageMatch[1] : '';
// 	const raw = Array.isArray(children) ? children.join('') : String(children ?? '');
	
// 		return (
// 		<SyntaxHighlighter
// 			language={language || 'javascript'}
// 			style={vscDarkPlus}
// 			PreTag="div"
// 			wrapLongLines
// 			showLineNumbers={false}
// 			customStyle={{ margin: 0, padding: '8px', borderRadius: '6px', background: '#1e1e1e' }}
// 			codeTagProps={{
// 			style: {
// 				fontFamily:
// 				'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
// 			},
// 			}}
// 		>
// 			{raw}
// 		</SyntaxHighlighter>
// 		);
// 	}
	
// 	const aiMarkdownOptions = {
// 		forceBlock: true,
// 		overrides: {
// 		code: { component: CodeBlock },
// 		h1: { props: { className: 'text-white font-semibold text-xl mb-2' } },
// 		h2: { props: { className: 'text-white font-semibold text-lg mb-2' } },
// 		p: { props: { className: 'text-white/95 leading-relaxed' } },
// 		li: { props: { className: 'text-white/95' } },
// 		a: { props: { className: 'text-blue-300 underline hover:text-blue-200' } },
// 		},
// 	};
	
// 	const Project = () => {
// 		const loc = useLocation();
	
// 		const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
// 		const [isUserModalOpen, setIsUserModalOpen] = useState(false);
	
// 		const [messages, setMessages] = useState([]);
// 		const [selectedUserIds, setSelectedUserIds] = useState(new Set());
// 		const [searchQuery, setSearchQuery] = useState('');
	
// 		const [users, setUsers] = useState([]);
// 		const [project, setProject] = useState(loc.state.project);
	
// 		const [message, setMessage] = useState('');
	
// 		// Code explorer/editor state
// 		const [fileTree, setFileTree] = useState({});
// 		const [currentFile, setCurrentFile] = useState(null);
// 		const [openFiles, setOpenFiles] = useState([]);
	
// 		const { user } = useContext(UserContext);
// 		const messageBoxRef = useRef(null);
	
// 		// --- Helpers ---
// 		const toStr = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));
// 		const lower = (v) => toStr(v).toLowerCase();
	
// 		function addCollaborators() {
// 		axios
// 			.put('/projects/add-user', {
// 			projectId: loc.state.project._id,
// 			users: Array.from(selectedUserIds),
// 			})
// 			.then(() => setIsUserModalOpen(false))
// 			.catch(() => setIsUserModalOpen(false));
// 		}
	
// 		function messageSend() {
// 		const text = toStr(message).trim();
// 		if (!text) return;
	
// 		// Broadcast over socket
// 		sendMessage('project-message', { message: text, sender: user });
	
// 		// Append locally via state (no innerHTML)
// 		appendOutgoingMessage(text);
// 		setMessage('');
// 		}
	
// 		useEffect(() => {
// 		initializeSocket(project._id);
	
// 		receiveMessage('project-message', (data) => {
// 			// Safely parse incoming messages; they may be plain text or JSON
// 			let payload = data?.message;
	
// 			if (typeof payload === 'string') {
// 			try {
// 				const maybe = JSON.parse(payload);
// 				if (maybe && typeof maybe === 'object') payload = maybe;
// 			} catch {
// 				// ignore parse errors; leave payload as string
// 			}
// 			}
	
// 			// Merge fileTree if provided by AI payload
// 			if (payload && typeof payload === 'object' && payload.fileTree) {
// 			setFileTree((prev) => ({ ...prev, ...payload.fileTree }));
// 			}
	
// 			// Normalize text for chat append
// 			const text =
// 			typeof payload === 'object'
// 				? toStr(payload.message ?? '')
// 				: toStr(payload);
	
// 			appendIncomingMessage({ ...data, message: text });
// 		});
	
// 		axios
// 			.get(`/projects/get-project/${loc.state.project._id}`)
// 			.then((res) => setProject(res.data.project))
// 			.catch(() => {});
	
// 		axios
// 			.get('/users/all')
// 			.then((res) => {
// 			const raw = res?.data?.users;
// 			const list = Array.isArray(raw) ? raw : [];
// 			// Normalize user objects to avoid undefined fields later
// 			const normalized = list.map((u) => {
// 				const id = u?._id ?? u?.id ?? u?.uuid ?? u?.email ?? cryptoRandomId();
// 				const nameCandidate =
// 				u?.name ?? u?.username ?? [u?.firstName, u?.lastName].filter(Boolean).join(' ');
// 				const email = toStr(u?.email);
// 				const name = nameCandidate || (email ? email.split('@')[0] : 'Unknown');
// 				return { _id: id, name: toStr(name), email };
// 			});
// 			setUsers(normalized);
// 			})
// 			.catch(() => setUsers([]));
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 		}, []);
	
// 		// Append helpers now only touch React state
// 		function appendIncomingMessage(messageObject) {
// 		const normalized = {
// 			_localId: cryptoRandomId(),
// 			message: toStr(messageObject?.message ?? ''),
// 			sender: messageObject?.sender ?? { _id: 'unknown', email: 'unknown' },
// 			createdAt: Date.now(),
// 			direction: 'incoming',
// 		};
// 		setMessages((prev) => [...prev, normalized]);
// 		}
	
// 		function appendOutgoingMessage(text) {
// 		const normalized = {
// 			_localId: cryptoRandomId(),
// 			message: toStr(text ?? ''),
// 			sender: user ?? { _id: 'me', email: 'me' },
// 			createdAt: Date.now(),
// 			direction: 'outgoing',
// 		};
// 		setMessages((prev) => [...prev, normalized]);
// 		}
	
// 		// Auto-scroll on new messages
// 		useEffect(() => {
// 		if (!messageBoxRef.current) return;
// 		const el = messageBoxRef.current;
// 		el.scrollTop = el.scrollHeight;
// 		}, [messages]);
	
// 		// Pick a default file when fileTree first arrives
// 		useEffect(() => {
// 		if (!currentFile) {
// 			const first = Object.keys(fileTree)[0];
// 			if (first) setCurrentFile(first);
// 		}
// 		}, [fileTree, currentFile]);
	
// 		// Fallback random id if backend gives none
// 		function cryptoRandomId() {
// 		return 'u_' + Math.random().toString(36).slice(2, 10);
// 		}
	
// 		const filteredUsers = useMemo(() => {
// 		if (!Array.isArray(users)) return [];
// 		const q = lower(searchQuery).trim();
// 		if (!q) return users;
// 		return users.filter((u) => lower(u?.name).includes(q) || lower(u?.email).includes(q));
// 		}, [users, searchQuery]);
	
// 		const toggleSelectUser = useCallback((id) => {
// 		setSelectedUserIds((prev) => {
// 			const next = new Set(prev);
// 			next.has(id) ? next.delete(id) : next.add(id);
// 			return next;
// 		});
// 		}, []);
	
// 		const deselectAll = useCallback(() => setSelectedUserIds(new Set()), []);
// 		const selectedCount = selectedUserIds.size;
	
// 		return (
// 		<main className="h-screen w-screen flex">
// 			{/* LEFT: Chat + header */}
// 			<section className="left relative flex flex-col h-full w-md bg-gray-200">
// 			{/* Header */}
// 			<header className="flex justify-between items-center p-3 px-4 w-full bg-slate-100">
// 				<button
// 				className="p-2 cursor-pointer flex gap-2 items-center"
// 				onClick={() => setIsUserModalOpen(true)}
// 				>
// 				<i className="ri-user-add-fill"></i>
// 				<p className="text-sm sm:text-base">Add Collaborators</p>
// 				</button>
// 				<button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2 cursor-pointer">
// 				<i className="ri-team-fill"></i>
// 				</button>
// 			</header>
	
// 			{/* Conversation area */}
// 			<div className="conversation-area py-2 flex flex-col flex-grow overflow-y-auto scrollbar-hide">
// 				<div
// 				ref={messageBoxRef}
// 				className="message-box flex-grow flex flex-col p-4 gap-1.5 overflow-y-auto"
// 				>
// 				{/* Render message list from state */}
// 				{messages.map((m) => {
// 					const isOutgoing = m.direction === 'outgoing' || m?.sender?._id === user?._id;
// 					const isAI = m?.sender?._id === 'ai';
// 					const containerClasses = [
// 					isOutgoing ? 'ml-auto' : '',
// 					'max-w-80 message flex flex-col p-2 w-fit rounded-md',
// 					isAI ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900',
// 					].join(' ');
// 					const senderTextClass = isAI
// 					? 'opacity-75 text-[11px] text-slate-200'
// 					: 'opacity-65 text-[11px] text-slate-600';
	
// 					return (
// 					<div key={m._localId} className={containerClasses}>
// 						<small className={senderTextClass}>{m?.sender?.email}</small>
// 						<div className="text-sm overflow-auto scrollbar-hide break-words whitespace-pre-wrap max-w-80 rounded-sm">
// 						{isAI ? (
// 							<Markdown options={aiMarkdownOptions}>{m.message}</Markdown>
// 						) : (
// 							m.message
// 						)}
// 						</div>
// 					</div>
// 					);
// 				})}
	
// 				{selectedCount > 0 && (
// 					<div className="mt-3 text-xs text-slate-600">
// 					Selected user ids:{' '}
// 					<span className="font-semibold">{Array.from(selectedUserIds).join(', ')}</span>
// 					</div>
// 				)}
// 				</div>
	
// 				{/* Input pinned to bottom */}
// 				<div className="inputField w-full flex p-3 bg-slate-100">
// 				<input
// 					value={message}
// 					onChange={(e) => setMessage(e.target.value)}
// 					onKeyDown={(e) => {
// 					if (e.key === 'Enter' && !e.shiftKey) {
// 						e.preventDefault();
// 						messageSend();
// 					}
// 					}}
// 					style={{ backgroundColor: 'rgba(255, 255, 255, 0.35)' }}
// 					className="py-2 pl-2 w-full border rounded-md outline-none"
// 					type="text"
// 					placeholder="Enter message"
// 				/>
// 				<button
// 					onClick={messageSend}
// 					className="cursor-pointer ml-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
// 				>
// 					<i className="ri-send-plane-fill"></i>
// 				</button>
// 				</div>
// 			</div>
	
// 			{/* Slide-in side panel */}
// 			<div
// 				className={`sidePanel w-full h-full flex flex-col gap-2 bg-blue-100 absolute transition-transform duration-300 ease-out ${
// 				isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'
// 				} top-0`}
// 			>
// 				<header className="flex justify-between items-center p-2 px-3 bg-slate-200">
// 				<h1>
// 					<strong>Collaborators:</strong>
// 				</h1>
// 				<button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2 cursor-pointer">
// 					<i className="ri-close-fill"></i>
// 				</button>
// 				</header>
	
// 				<div className="users flex flex-col gap-2 px-2 pb-4 overflow-y-auto">
// 				{project.users &&
// 					project.users.map((u) => {
// 					return (
// 						<div
// 						key={u._id || u.email}
// 						className="user cursor-pointer hover:bg-slate-100 flex gap-3 items-center p-2 rounded-md"
// 						>
// 						<div className="relative rounded-full w-10 h-10 flex items-center justify-center bg-gray-200">
// 							<i className="ri-user-4-line text-lg"></i>
// 						</div>
// 						<h1 className="font-semibold text-base sm:text-lg">{u.email}</h1>
// 						</div>
// 					);
// 					})}
// 				</div>
// 			</div>
// 			</section>
	
// 			{/* RIGHT: Explorer + Editor */}
// 			<section className="right bg-slate-100 flex-grow h-full flex">
// 			<div className="explorer bg-slate-500 h-full max-w-64 min-w-56">
// 				<div className="file-tree w-full border-solid">
// 				{Object.keys(fileTree).map((file) => {
// 					return (
// 					<button
// 						key={file}
// 						className="tree-element border-solid cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-200 w-full"
// 						onClick={() => {
// 						setCurrentFile(file);
// 						setOpenFiles((prev) => (prev.includes(file) ? prev : [...prev, file]));
// 						}}
// 					>
// 						<p className="font-semibold text-md">{file}</p>
// 					</button>
// 					);
// 				})}
// 				</div>
// 			</div>
	
// 			{currentFile && (
// 				<div className="code-editor flex flex-col flex-grow h-full">
// 				<div className="top flex">
// 					{Array.isArray(openFiles) &&
// 					openFiles.map((file) => (
// 						<button
// 						key={String(file)}
// 						onClick={() => setCurrentFile(file)}
// 						className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 ${
// 							currentFile === file ? 'bg-slate-500 text-white' : 'bg-slate-300'
// 						}`}
// 						>
// 						<p className="font-semibold text-md">{String(file)}</p>
// 						</button>
// 					))}
// 				</div>
// 				<div className="bottom flex flex-grow">
// 					{fileTree[currentFile] && (
// 					<textarea
// 						value={fileTree[currentFile]?.content ?? ''}
// 						onChange={(e) => {
// 						const content = e.target.value;
// 						setFileTree((prev) => ({
// 							...prev,
// 							[currentFile]: { ...(prev[currentFile] || {}), content },
// 						}));
// 						}}
// 						className="w-full h-full p-4 bg-slate-200 overflow-auto"
// 					/>
// 					)}
// 				</div>
// 				</div>
// 			)}
// 			</section>
	
// 			{/* Users Modal */}
// 			{isUserModalOpen && (
// 			<div
// 				className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
// 				aria-modal="true"
// 				role="dialog"
// 			>
// 				{/* Click outside to close */}
// 				<div className="absolute inset-0" onClick={() => setIsUserModalOpen(false)} />
// 				<div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-lg p-4 sm:p-6 max-h-[85vh] overflow-hidden flex flex-col">
// 				<div className="flex items-center justify-between mb-3">
// 					<h2 className="text-lg sm:text-xl font-semibold">Add Collaborators</h2>
// 					<button
// 					className="p-2 rounded-md hover:bg-slate-100"
// 					onClick={() => setIsUserModalOpen(false)}
// 					aria-label="Close"
// 					>
// 					<i className="ri-close-line text-xl"></i>
// 					</button>
// 				</div>
	
// 				{/* Search */}
// 				<div className="mb-3 flex gap-2">
// 					<input
// 					className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
// 					placeholder="Search users…"
// 					value={searchQuery}
// 					onChange={(e) => setSearchQuery(e.target.value)}
// 					/>
// 					{searchQuery && (
// 					<button
// 						className="px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
// 						onClick={() => setSearchQuery('')}
// 						title="Clear search"
// 					>
// 						<i className="ri-close-circle-line"></i>
// 					</button>
// 					)}
// 				</div>
	
// 				{/* Users list */}
// 				<div className="overflow-y-auto flex-1 pr-1">
// 					{filteredUsers.length === 0 ? (
// 					<div className="text-sm text-slate-500 p-3">No users found.</div>
// 					) : (
// 					<ul className="divide-y divide-slate-200">
// 						{filteredUsers.map((u) => {
// 						const isSelected = selectedUserIds.has(u._id);
// 						return (
// 							<li key={u._id}>
// 							<button
// 								onClick={() => toggleSelectUser(u._id)}
// 								className={`w-full text-left flex items-center gap-3 p-3 hover:bg-slate-50 focus:outline-none rounded-md ${
// 								isSelected ? 'bg-blue-50 ring-1 ring-blue-400' : ''
// 								}`}
// 							>
// 								<div className="relative rounded-full w-10 h-10 flex items-center justify-center bg-gray-200 shrink-0">
// 								<i className="ri-user-3-line text-lg"></i>
// 								</div>
// 								<div className="min-w-0 flex-1">
// 								<p className="font-medium truncate">{u.name}</p>
// 								<p className="text-xs text-slate-600 truncate">{u.email}</p>
// 								</div>
// 								<div
// 								className={`w-5 h-5 rounded border flex items-center justify-center ${
// 									isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white'
// 								}`}
// 								>
// 								{isSelected && <i className="ri-check-line text-sm leading-none" />}
// 								</div>
// 							</button>
// 							</li>
// 						);
// 						})}
// 					</ul>
// 					)}
// 				</div>
	
// 				{/* Selected summary */}
// 				<div className="mt-3 flex items-center justify-between text-sm">
// 					<span className="text-slate-600">{selectedCount} selected</span>
// 					{selectedCount > 0 && (
// 					<div className="hidden sm:flex gap-2 flex-wrap max-w-[65%]">
// 						{Array.from(selectedUserIds).map((id) => {
// 						const u = users.find((x) => x._id === id);
// 						if (!u) return null;
// 						return (
// 							<span key={id} className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
// 							{u.name}
// 							</span>
// 						);
// 						})}
// 					</div>
// 					)}
// 				</div>
	
// 				{/* Actions */}
// 				<div className="mt-4 flex flex-wrap items-center justify-end gap-2">
// 					<button
// 					className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
// 					onClick={() => setIsUserModalOpen(false)}
// 					>
// 					Cancel
// 					</button>
	
// 					<button
// 					className="px-4 py-2 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
// 					disabled={selectedCount === 0}
// 					onClick={deselectAll}
// 					>
// 					Clear Selection
// 					</button>
	
// 					<button
// 					className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
// 					disabled={selectedCount === 0}
// 					onClick={addCollaborators}
// 					>
// 					Add Selected ({selectedCount})
// 					</button>
// 				</div>
// 				</div>
// 			</div>
// 			)}
// 		</main>
// 		);
// 	};

// export default Project;





import React, {
	useState,
	useMemo,
	useCallback,
	useEffect,
	useContext,
	useRef,
  } from 'react';
import { useLocation } from 'react-router-dom';
import Markdown from 'markdown-to-jsx';
import axios from '../config/axios.js';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket.js';
import { UserContext } from '../context/user.context.jsx';

  // Syntax highlighting for AI code blocks
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

  // Reusable Markdown renderer so AI messages get VS Code-like code highlighting
function CodeBlock({ className, children }) {
	const languageMatch = /language-(\w+)/.exec(className || '');
	const language = languageMatch ? languageMatch[1] : '';
	const raw = Array.isArray(children) ? children.join('') : String(children ?? '');

	return (
		<SyntaxHighlighter
		language={language || 'javascript'}
		style={vscDarkPlus}
		PreTag="div"
		wrapLongLines
		showLineNumbers={false}
		customStyle={{ margin: 0, padding: '8px', borderRadius: '6px', background: '#1e1e1e' }}
		codeTagProps={{
		  style: {
			fontFamily:
			  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
		  },
		}}
	  >
		{raw}
	  </SyntaxHighlighter>
	);
  }
  
  const aiMarkdownOptions = {
	forceBlock: true,
	overrides: {
	  code: { component: CodeBlock },
	  h1: { props: { className: 'text-white font-semibold text-xl mb-2' } },
	  h2: { props: { className: 'text-white font-semibold text-lg mb-2' } },
	  p: { props: { className: 'text-white/95 leading-relaxed' } },
	  li: { props: { className: 'text-white/95' } },
	  a: { props: { className: 'text-blue-300 underline hover:text-blue-200' } },
	},
  };
  
  const Project = () => {
	const loc = useLocation();
  
	const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
	const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
	const [messages, setMessages] = useState([]);
	const [selectedUserIds, setSelectedUserIds] = useState(new Set());
	const [searchQuery, setSearchQuery] = useState('');
  
	const [users, setUsers] = useState([]);
	const [project, setProject] = useState(loc.state.project);
  
	const [message, setMessage] = useState('');
  
	// Code explorer/editor state
	const [fileTree, setFileTree] = useState({});
	const [currentFile, setCurrentFile] = useState(null);
	const [openFiles, setOpenFiles] = useState([]);
  
	const { user } = useContext(UserContext);
	const messageBoxRef = useRef(null);
  
	// --- Helpers ---
	const toStr = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));
	const lower = (v) => toStr(v).toLowerCase();
  
	function addCollaborators() {
	  axios
		.put('/projects/add-user', {
		  projectId: project._id,
		  users: Array.from(selectedUserIds),
		})
		.then(() => {
		  // Refresh project to reflect new collaborators in the UI
		  axios
			.get(`/projects/get-project/${project._id}`)
			.then((res) => {
			  setProject(res.data.project);
			  setSelectedUserIds(new Set());
			  setIsUserModalOpen(false);
			})
			.catch(() => setIsUserModalOpen(false));
		})
		.catch(() => setIsUserModalOpen(false));
	}
  
	function messageSend() {
	  const text = toStr(message).trim();
	  if (!text) return;
  
	  // Broadcast over socket
	  sendMessage('project-message', { message: text, sender: user });
  
	  // Append locally via state (no innerHTML)
	  appendOutgoingMessage(text);
	  setMessage('');
	}
  
	useEffect(() => {
	  initializeSocket(project._id);
  
	  receiveMessage('project-message', data => {
		// Safely parse incoming messages; they may be plain text or JSON
		console.log(data);

		const code = data.message;

		if(code.fileTree) {
			setFileTree(code.fileTree || {});
		}
		
		let payload = data?.message;
  
		if (typeof payload === 'string') {
		  try {
			const maybe = JSON.parse(payload);
			if (maybe && typeof maybe === 'object') payload = maybe;
		  } catch {
			// ignore parse errors; leave payload as string
		  }
		}
  
		// Merge fileTree if provided by AI payload
		if (payload && typeof payload === 'object' && payload.fileTree) {
		  setFileTree((prev) => ({ ...prev, ...payload.fileTree }));
		}
  
		// Normalize text for chat append
		const text =
		  typeof payload === 'object'
			? toStr(payload.message ?? '')
			: toStr(payload);
  
		appendIncomingMessage({ ...data, message: text });
	  });
  
	  axios
		.get(`/projects/get-project/${loc.state.project._id}`)
		.then((res) => setProject(res.data.project))
		.catch(() => {});
  
	  axios
		.get('/users/all')
		.then((res) => {
		  const raw = res?.data?.users;
		  const list = Array.isArray(raw) ? raw : [];
		  // Normalize user objects to avoid undefined fields later
		  const normalized = list.map((u) => {
			const id = u?._id ?? u?.id ?? u?.uuid ?? u?.email ?? cryptoRandomId();
			const nameCandidate =
			  u?.name ?? u?.username ?? [u?.firstName, u?.lastName].filter(Boolean).join(' ');
			const email = toStr(u?.email);
			const name = nameCandidate || (email ? email.split('@')[0] : 'Unknown');
			return { _id: id, name: toStr(name), email };
		  });
		  setUsers(normalized);
		})
		.catch(() => setUsers([]));
	  // eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
  
	// Append helpers now only touch React state
	function appendIncomingMessage(messageObject) {
	  const normalized = {
		_localId: cryptoRandomId(),
		message: toStr(messageObject?.message ?? ''),
		sender: messageObject?.sender ?? { _id: 'unknown', email: 'unknown' },
		createdAt: Date.now(),
		direction: 'incoming',
	  };
	  setMessages((prev) => [...prev, normalized]);
	}
  
	function appendOutgoingMessage(text) {
	  const normalized = {
		_localId: cryptoRandomId(),
		message: toStr(text ?? ''),
		sender: user ?? { _id: 'me', email: 'me' },
		createdAt: Date.now(),
		direction: 'outgoing',
	  };
	  setMessages((prev) => [...prev, normalized]);
	}
  
	// Auto-scroll on new messages
	useEffect(() => {
	  if (!messageBoxRef.current) return;
	  const el = messageBoxRef.current;
	  el.scrollTop = el.scrollHeight;
	}, [messages]);
  
	// Pick a default file when fileTree first arrives
	useEffect(() => {
	  if (!currentFile) {
		const first = Object.keys(fileTree)[0];
		if (first) setCurrentFile(first);
	  }
	}, [fileTree, currentFile]);
  
	// Fallback random id if backend gives none
	function cryptoRandomId() {
	  return 'u_' + Math.random().toString(36).slice(2, 10);
	}
  
	const filteredUsers = useMemo(() => {
	  if (!Array.isArray(users)) return [];
	  const q = lower(searchQuery).trim();
	  if (!q) return users;
	  return users.filter((u) => lower(u?.name).includes(q) || lower(u?.email).includes(q));
	}, [users, searchQuery]);
  
	const toggleSelectUser = useCallback((id) => {
	  setSelectedUserIds((prev) => {
		const next = new Set(prev);
		next.has(id) ? next.delete(id) : next.add(id);
		return next;
	  });
	}, []);
  
	const deselectAll = useCallback(() => setSelectedUserIds(new Set()), []);
	const selectedCount = selectedUserIds.size;
  
	return (
	  <main className="h-screen w-screen flex">
		{/* LEFT: Chat + header */}
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
			<button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2 cursor-pointer">
			  <i className="ri-team-fill"></i>
			</button>
		  </header>
  
		  {/* Conversation area */}
		  <div className="conversation-area py-2 flex flex-col flex-grow overflow-y-auto scrollbar-hide">
			<div
			  ref={messageBoxRef}
			  className="message-box flex-grow flex flex-col p-4 gap-1.5 overflow-y-auto"
			>
			  {/* Render message list from state */}
			  {messages.map((m) => {
				const isOutgoing = m.direction === 'outgoing' || m?.sender?._id === user?._id;
				const isAI = m?.sender?._id === 'ai';
				const containerClasses = [
				  isOutgoing ? 'ml-auto' : '',
				  'max-w-80 message flex flex-col p-2 w-fit rounded-md',
				  isAI ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900',
				].join(' ');
				const senderTextClass = isAI
				  ? 'opacity-75 text-[11px] text-slate-200'
				  : 'opacity-65 text-[11px] text-slate-600';
  
				return (
				  <div key={m._localId} className={containerClasses}>
					<small className={senderTextClass}>{m?.sender?.email}</small>
					<div className="text-sm overflow-auto scrollbar-hide break-words whitespace-pre-wrap max-w-80 rounded-sm">
					  {isAI ? (
						<Markdown options={aiMarkdownOptions}>{m.message}</Markdown>
					  ) : (
						m.message
					  )}
					</div>
				  </div>
				);
			  })}
  
			  {selectedCount > 0 && (
				<div className="mt-3 text-xs text-slate-600">
				  Selected user ids:{' '}
				  <span className="font-semibold">{Array.from(selectedUserIds).join(', ')}</span>
				</div>
			  )}
			</div>
  
			{/* Input pinned to bottom */}
			<div className="inputField w-full flex p-3 bg-slate-100">
			  <input
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyDown={(e) => {
				  if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					messageSend();
				  }
				}}
				style={{ backgroundColor: 'rgba(255, 255, 255, 0.35)' }}
				className="py-2 pl-2 w-full border rounded-md outline-none"
				type="text"
				placeholder="Enter message"
			  />
			  <button
				onClick={messageSend}
				className="cursor-pointer ml-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
			  >
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
			  <h1>
				<strong>Collaborators:</strong>
			  </h1>
			  <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2 cursor-pointer">
				<i className="ri-close-fill"></i>
			  </button>
			</header>
  
			<div className="users flex flex-col gap-2 px-2 pb-4 overflow-y-auto">
			  {project.users &&
				project.users.map((u) => {
				  return (
					<div
					  key={u._id || u.email}
					  className="user cursor-pointer hover:bg-slate-100 flex gap-3 items-center p-2 rounded-md"
					>
					  <div className="relative rounded-full w-10 h-10 flex items-center justify-center bg-gray-200">
						<i className="ri-user-4-line text-lg"></i>
					  </div>
					  <h1 className="font-semibold text-base sm:text-lg">{u.email}</h1>
					</div>
				  );
				})}
			</div>
		  </div>
		</section>
  
		{/* RIGHT: Explorer + Editor */}
		<section className="right bg-slate-100 flex-grow h-full flex">
		  <div className="explorer bg-slate-500 h-full max-w-64 min-w-56">
			<div className="file-tree w-full border-solid">
			  {Object.keys(fileTree).map((file, index) => {
				return (
				  <button
					key={file}
					className="tree-element border-solid cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-200 w-full"
					onClick={() => {
					  setCurrentFile(file);
					  setOpenFiles((prev) => (prev.includes(file) ? prev : [...prev, file]));
					}}
				  >
					<p className="font-semibold text-md">{file}</p>
				  </button>
				);
			  })}
			</div>
		  </div>
  
		  {currentFile && (
			<div className="code-editor flex flex-col flex-grow h-full">
			  <div className="top flex">
				{Array.isArray(openFiles) &&
				  openFiles.map((file) => (
					<button
					  key={String(file)}
					  onClick={() => setCurrentFile(file)}
					  className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 ${
						currentFile === file ? 'bg-slate-500 text-white' : 'bg-slate-300'
					  }`}
					>
					  <p className="font-semibold text-md">{String(file)}</p>
					</button>
				  ))}
			  </div>
			  <div className="bottom flex flex-grow">
				{fileTree[currentFile] && (
				  <textarea
					value={fileTree[currentFile]?.content ?? ''}
					onChange={(e) => {
					  const content = e.target.value;
					  setFileTree((prev) => ({
						...prev,
						[currentFile]: { ...(prev[currentFile] || {}), content },
					  }));
					}}
					className="w-full h-full p-4 bg-slate-200 overflow-auto"
				  />
				)}
			  </div>
			</div>
		  )}
		</section>
  
		{/* Users Modal */}
		{isUserModalOpen && (
		  <div
			className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
			aria-modal="true"
			role="dialog"
		  >
			{/* Click outside to close */}
			<div className="absolute inset-0" onClick={() => setIsUserModalOpen(false)} />
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
								isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white'
							  }`}
							>
							  {isSelected && <i className="ri-check-line text-sm leading-none" />}
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
						<span key={id} className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
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