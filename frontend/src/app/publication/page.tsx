"use client";

import { useEffect, useState } from "react";

interface Researcher {
  id: number;
  bio: string;
  picture: string | null;
  platforms: { platform_id: string }[];
  publications: {
    type: string;
    title: string;
    authors: string[];
    info: string;
    doi_url: string;
    pdf: string | null;
  }[];
}

export default function Publications() {
  const [researcher, setResearcher] = useState<Researcher | null>(null);

  useEffect(() => {
    // Assume researcher ID 1 for simplicity
    fetch("http://localhost:8000/api/researchers/1/")
      .then((res) => res.json())
      .then(setResearcher);
  }, []);

  if (!researcher) return <div>Loading...</div>;

  return (
    <div className="border p-4 max-w-md mx-auto">
      <h2 className="text-center">Publications [Output from DB]</h2>
      {researcher.picture && <img src={`http://localhost:8000${researcher.picture}`} alt="Bio Picture" className="w-32" />}
      <p>{researcher.bio}</p>
      {researcher.platforms.map((p, i) => (
        <p key={i}>Platform: {p.platform_id}</p>
      ))}
      {researcher.publications.map((pub, i) => (
        <div key={i} className="border-t mt-2">
          <h3>{pub.title}</h3>
          <p>Authors: {pub.authors.join(", ")}</p>
          <p>{pub.info}</p>
          {pub.doi_url && <a href={pub.doi_url}>DOI / URL</a>}
          {pub.pdf && <a href={`http://localhost:8000${pub.pdf}`}>PDF</a>}
          {/* Add links for ABS, HTML if needed */}
        </div>
      ))}
    </div>
  );
}