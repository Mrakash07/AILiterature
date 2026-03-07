'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function CyberBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0A0A0F]">
            {/* Base Grid */}
            <div
                className="absolute inset-0 opacity-[0.1]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0, 245, 255, 0.2) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 245, 255, 0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }}
            />

            {/* Glowing Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                    x: [0, 50, 0],
                    y: [0, -30, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-neon-cyan/20 blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.1, 0.15, 0.1],
                    x: [0, -40, 0],
                    y: [0, 60, 0]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-neon-purple/20 blur-[120px]"
            />
            <motion.div
                animate={{
                    opacity: [0.05, 0.1, 0.05],
                    scale: [0.8, 1, 0.8],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-electric-blue/5 blur-[150px]"
            />

            {/* Animated Particles (Simplified) */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <Particle key={i} />
                ))}
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,245,255,0.02)_50%)] bg-[length:100%_4px]" />
        </div>
    )
}

function Particle() {
    const [style, setStyle] = useState({
        left: '50%',
        top: '50%',
        size: 0,
        duration: 0,
        delay: 0
    })

    useEffect(() => {
        setStyle({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5
        })
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, 0.5, 0],
                y: [0, -100],
                scale: [0, 1, 0]
            }}
            transition={{
                duration: style.duration,
                repeat: Infinity,
                delay: style.delay,
                ease: 'linear'
            }}
            style={{
                position: 'absolute',
                left: style.left,
                top: style.top,
                width: style.size,
                height: style.size,
                backgroundColor: '#00F5FF',
                borderRadius: '50%',
                boxShadow: '0 0 10px #00F5FF'
            }}
        />
    )
}
