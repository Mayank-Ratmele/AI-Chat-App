import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from "../config/axios.js";

function Home() {
  const nav = useNavigate();
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]); // renamed to projects for consistency

  function createProject(e) {
    e.preventDefault();
    axios.post('/projects/create', {
      name: projectName,
    }).then((res) => {
      console.log("Project created:", res.data);
      // Refresh list after creating
      setProjects((prev) => [...prev, res.data.project]);
      setProjectName('');
      setIsModalOpen(false);
    }).catch((error) => {
      console.log(error);
    });
  }

  useEffect(() => {
    axios.get('/projects/all')
      .then((res) => {
        // console.log(res.data);
        setProjects(res.data.projects || []);
      })
      .catch(err => {
        console.log(err);
      });
  }, []); // ✅ run only once when component mounts

  return (
    <main className="p-4">
      <div className="projects space-y-4 flex flex-wrap gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="project cursor-pointer p-4 border border-slate-300 rounded-md hover:bg-slate-100 flex items-center"
        >
          <i className="ri-pencil-fill mr-2"></i>
          New Project
        </button>

        {projects.map((project) => (
          <div
            onClick={() => {nav('/project', {
              state: { project }
            })
          }}
            key={project._id}
            className="project flex flex-col cursor-pointer p-4 border border-slate-300 rounded-md hover:bg-slate-100"
          >
            <div className="flex flex-wrap">
              <i className="ri-link mr-2"></i>
              <h2 className="font-medium">{project.name}</h2>
            </div>

            <div className="flex items-center space-x-1 mt-2 text-m text-gray-600">
              <p><i className="ri-user-3-fill"></i>collaborators:</p>
              <span>{project.users?.length || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={createProject} className="space-y-4">
              <input
                type="text"
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;

