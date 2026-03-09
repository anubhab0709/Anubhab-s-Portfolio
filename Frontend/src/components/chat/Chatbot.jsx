import { useMemo, useState } from 'react';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

const CHAT_KEY_STORAGE = 'portfolio_openai_api_key';
const CHAT_SESSION_STORAGE = 'portfolio_chat_session_id';

const INITIAL_BOT_MESSAGE = {
	role: 'assistant',
	content: "Hey! I'm Anubhab's AI assistant. Ask me about projects, skills, experience, or contact details."
};

function Chatbot() {
	const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
	const [isOpen, setIsOpen] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [messages, setMessages] = useState([INITIAL_BOT_MESSAGE]);
	const [sessionId, setSessionId] = useState(() => {
		if (typeof window === 'undefined') {
			return '';
		}

		return window.localStorage.getItem(CHAT_SESSION_STORAGE) || '';
	});
	const [userApiKey, setUserApiKey] = useState(() => {
		if (typeof window === 'undefined') {
			return '';
		}

		return window.localStorage.getItem(CHAT_KEY_STORAGE) || '';
	});

	const handleSubmit = async (event) => {
		event.preventDefault();
		const trimmed = inputValue.trim();
		if (!trimmed || isSending) {
			return;
		}

		if (trimmed.startsWith('/setkey')) {
			const nextKey = trimmed.replace('/setkey', '').trim();
			if (!nextKey || !nextKey.startsWith('sk-')) {
				setMessages((prev) => [
					...prev,
					{
						role: 'assistant',
						content: 'Invalid key format. Use: /setkey YOUR_OPENAI_API_KEY'
					}
				]);
				setInputValue('');
				return;
			}

			window.localStorage.setItem(CHAT_KEY_STORAGE, nextKey);
			setUserApiKey(nextKey);
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: 'Your OpenAI key is saved in this browser and will be used for chat requests.'
				}
			]);
			setInputValue('');
			return;
		}

		if (trimmed === '/clearkey') {
			window.localStorage.removeItem(CHAT_KEY_STORAGE);
			setUserApiKey('');
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: 'Stored key cleared. Chat will now use the backend .env key.'
				}
			]);
			setInputValue('');
			return;
		}

		const nextUserMessage = { role: 'user', content: trimmed };
		const historyForRequest = messages.slice(-10);

		setMessages((prev) => [...prev, nextUserMessage]);
		setInputValue('');
		setIsSending(true);

		try {
			const headers = {
				'Content-Type': 'application/json'
			};

			if (userApiKey) {
				headers['x-openai-api-key'] = userApiKey;
			}

			const response = await fetch(`${apiBaseUrl}/chat`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					sessionId,
					message: trimmed,
					history: historyForRequest
				})
			});

			const payload = await response.json();

			if (!response.ok || !payload?.success) {
				throw new Error(payload?.message || 'Unable to get reply right now.');
			}

			const assistantReply = payload?.data?.reply;
			if (!assistantReply) {
				throw new Error('The assistant returned an empty response.');
			}

			const nextSessionId = payload?.data?.sessionId;
			if (typeof nextSessionId === 'string' && nextSessionId.length > 0) {
				window.localStorage.setItem(CHAT_SESSION_STORAGE, nextSessionId);
				setSessionId(nextSessionId);
			}

			setMessages((prev) => [...prev, { role: 'assistant', content: assistantReply }]);
		} catch (error) {
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: error.message || 'Chat service is temporarily unavailable. Please try again shortly.'
				}
			]);
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div className={`chatbot ${isOpen ? 'open' : ''}`}>
			{isOpen ? (
				<section className="chatbot-panel" aria-label="Portfolio chatbot">
					<header className="chatbot-header">
						<div>
							<p className="chatbot-label">AI Assistant</p>
							<h3>Ask About My Work</h3>
						</div>
						<button type="button" className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chatbot">
							Close
						</button>
					</header>

					<div className="chatbot-messages">
						{messages.map((item, index) => (
							<article key={`${item.role}-${index}`} className={`chatbot-message ${item.role}`}>
								<p>{item.content}</p>
							</article>
						))}
						{isSending ? <p className="chatbot-thinking">Assistant is thinking...</p> : null}
					</div>

					<form className="chatbot-form" onSubmit={handleSubmit}>
						<input
							type="text"
							value={inputValue}
							onChange={(event) => setInputValue(event.target.value)}
							placeholder="Ask about projects, internships, skills..."
							maxLength={1200}
							disabled={isSending}
						/>
						<button type="submit" disabled={isSending || !inputValue.trim()}>
							Send
						</button>
					</form>
				</section>
			) : null}

			<button type="button" className="chatbot-toggle" onClick={() => setIsOpen((prev) => !prev)}>
				Chat with AI
			</button>
		</div>
	);
}

export default Chatbot;
