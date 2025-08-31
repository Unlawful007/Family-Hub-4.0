import React, { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addVoiceMessage, deleteVoiceMessage } from '../../services/db';
import { Mic, Trash2, Check } from '../icons/LucideIcons';
import { VoiceMessage } from '../../types';

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white/60 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-2xl p-4 shadow-md ${className}`}>
        {children}
    </div>
);

const VoiceMessageBoardWidget: React.FC = () => {
    const [recording, setRecording] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<number | undefined>();
    const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
    const [playedMessages, setPlayedMessages] = useState<Set<number>>(new Set());
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    
    const members = useLiveQuery(() => db.members.toArray(), []);
    const messages = useLiveQuery(async () => {
        const rawMessages = await db.voiceMessages.orderBy('timestamp').reverse().toArray();
        // Fix: Provide an empty array fallback to `new Map` to ensure correct type inference even when `members` is initially undefined.
        // This prevents the map from being inferred as `Map<any, any>`.
        const memberMap = new Map((members || []).map(m => [m.id, m]));
        return rawMessages.map(msg => ({
            ...msg,
            memberName: memberMap.get(msg.memberId)?.name || 'Unknown',
            memberInitials: memberMap.get(msg.memberId)?.initials || '?',
            memberColor: memberMap.get(msg.memberId)?.color_hex || '#808080',
        }));
    }, [members]);

    useEffect(() => {
        if (!selectedMemberId && members && members.length > 0) {
            setSelectedMemberId(members[0].id);
        }
    }, [members]);

    const startRecording = async () => {
        if (!selectedMemberId) {
            alert("Please select a member before recording.");
            return;
        }
        if (!window.isSecureContext) {
            alert("Recording voice messages requires a secure connection (HTTPS).");
            return;
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Your browser does not support recording audio.");
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };
            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                await addVoiceMessage({ memberId: selectedMemberId, audioBlob });
                audioChunks.current = [];
            };
            mediaRecorder.current.start();
            setRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
            setRecording(false);
        }
    };
    
    const handleAudioEnded = (id?: number) => {
        if (id !== undefined) {
            setPlayedMessages(prev => new Set(prev).add(id));
        }
    };

    const handleDelete = (id?: number) => {
        if (!id) return;

        // Only allow delete interaction if message has been played
        if (!playedMessages.has(id)) {
            return;
        }
    
        if (confirmingDelete === id) {
            deleteVoiceMessage(id);
            setConfirmingDelete(null);
        } else {
            setConfirmingDelete(id);
            // Reset confirmation after a few seconds
            setTimeout(() => {
                setConfirmingDelete(currentId => (currentId === id ? null : currentId));
            }, 3000);
        }
    };

    return (
        <GlassCard>
            <h3 className="font-bold mb-3">Voice Messages</h3>
            <div className="flex items-center space-x-2 mb-3">
                <select 
                    value={selectedMemberId} 
                    onChange={(e) => setSelectedMemberId(Number(e.target.value))}
                    className="flex-1 bg-black/5 dark:bg-white/10 rounded-md px-3 py-1.5 text-sm border-0 focus:ring-2 focus:ring-inset focus:ring-brand-primary text-gray-900"
                >
                    {members?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button 
                    onClick={recording ? stopRecording : startRecording}
                    className={`p-2 rounded-full text-white transition-colors ${recording ? 'bg-red-500 animate-pulse' : 'bg-brand-primary'}`}
                >
                    <Mic className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {messages?.map(msg => {
                    const isPlayed = msg.id !== undefined && playedMessages.has(msg.id);
                    const isConfirming = confirmingDelete === msg.id;

                    return (
                        <div key={msg.id} className="flex items-center space-x-2 group">
                            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: msg.memberColor }}>
                                {msg.memberInitials}
                            </div>
                            <audio 
                                controls 
                                src={URL.createObjectURL(msg.audioBlob)} 
                                className="w-full h-8"
                                onEnded={() => handleAudioEnded(msg.id)}
                            ></audio>
                             <button 
                                 onClick={() => handleDelete(msg.id)} 
                                 className={`p-1 rounded-full transition-all duration-200 ${
                                    isConfirming 
                                    ? 'bg-red-500/20 text-red-500 opacity-100' 
                                    : `text-gray-400 dark:text-white/40 hover:text-red-500 opacity-0 group-hover:opacity-100 ${!isPlayed ? 'cursor-not-allowed' : ''}`
                                 }`}
                                 aria-label={isConfirming ? 'Confirm delete' : 'Delete message'}
                                 title={isPlayed ? (isConfirming ? 'Confirm delete' : 'Delete message') : 'Play message to enable deletion'}
                             >
                                {isConfirming ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                        </div>
                    );
                })}
                {messages?.length === 0 && <p className="text-xs text-center text-gray-500 dark:text-white/60 py-4">No messages yet.</p>}
            </div>
        </GlassCard>
    );
};

export default VoiceMessageBoardWidget;
