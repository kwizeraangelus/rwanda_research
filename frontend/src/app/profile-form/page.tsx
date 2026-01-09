"use client";

import { useState } from "react";

export default function ProfileForm() {
  const [bio, setBio] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [newPlatform, setNewPlatform] = useState("");

  const addPlatform = () => {
    if (newPlatform) {
      setPlatforms([...platforms, newPlatform]);
      setNewPlatform("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("bio", bio);
    if (picture) formData.append("picture", picture);

    // Assume creating researcher first
    const res = await fetch("http://localhost:8000/api/researchers/", {
      method: "POST",
      body: formData,
    });
    const researcher = await res.json();

    // Add platforms
    for (const plat of platforms) {
      await fetch("http://localhost:8000/api/platforms/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ researcher: researcher.id, platform_id: plat }),
      });
    }
    alert("Profile submitted!");
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 max-w-md mx-auto">
      <h2 className="text-center">Researcher Profile [Form]</h2>
      <textarea
        placeholder="Bio / CV / Resume"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="border w-full mb-2"
      />
      <input
        type="file"
        onChange={(e) => setPicture(e.target.files?.[0] || null)}
        className="mb-2"
      />
      <label>Academic platforms</label>
      <input
        placeholder="Platform ID"
        value={newPlatform}
        onChange={(e) => setNewPlatform(e.target.value)}
        className="border w-full mb-2"
      />
      <button type="button" onClick={addPlatform} className="mb-2">
        Add platform
      </button>
      <ul>
        {platforms.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
      <button type="submit" className="border w-full">
        Submit
      </button>
    </form>
  );
}