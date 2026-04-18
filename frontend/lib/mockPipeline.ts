export interface PipelineEvent {
  agent: string;
  status: 'running' | 'done' | 'error' | 'pipeline_complete';
  message: string;
  output?: string;
  files?: Array<{ filename: string; language: string; content: string }>;
}

export const runMockPipeline = (task: string, scope: string) => {
  let isCancelled = false;
  let onMessageCallback: ((data: PipelineEvent) => void) | null = null;
  let onErrorCallback: ((err: any) => void) | null = null;

  const demoFiles = [
    {
      filename: "frontend/app/page.tsx",
      language: "tsx",
      content: `'use client';\n\nimport Dashboard from '@/components/Dashboard';\n\nexport default function Home() {\n  return (\n    <main className="min-h-screen bg-gray-950 text-white p-8">\n      <div className="max-w-6xl mx-auto">\n        <h1 className="text-3xl font-bold mb-8 text-amber-500">Student Portal</h1>\n        <Dashboard studentId="std_98231" />\n      </div>\n    </main>\n  );\n}`
    },
    {
      filename: "frontend/components/Dashboard.tsx",
      language: "tsx",
      content: `'use client';\n\nimport React, { useEffect, useState } from 'react';\n\ninterface Course { id: string; name: string; grade: string; }\ninterface StudentData { name: string; gpa: number; courses: Course[]; }\n\nexport default function Dashboard({ studentId }: { studentId: string }) {\n  const [data, setData] = useState<StudentData | null>(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    fetch(\`/api/students/\${studentId}\`)\n      .then(res => res.json())\n      .then(json => {\n        setData(json);\n        setLoading(false);\n      })\n      .catch(err => console.error(err));\n  }, [studentId]);\n\n  if (loading) return <div className="animate-pulse">Loading grades...</div>;\n  if (!data) return <div>Data unavailable.</div>;\n\n  return (\n    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\n      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">\n        <h2 className="text-xl font-semibold mb-2">Welcome, {data.name}</h2>\n        <p className="text-gray-400">Current GPA: <span className="text-amber-500 font-bold">{data.gpa.toFixed(2)}</span></p>\n      </div>\n      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">\n        <h3 className="text-lg font-medium mb-4">Enrolled Courses</h3>\n        <ul className="space-y-3">\n          {data.courses.map(course => (\n            <li key={course.id} className="flex justify-between border-b border-gray-800 pb-2">\n              <span>{course.name}</span>\n              <span className="font-mono text-emerald-400">{course.grade}</span>\n            </li>\n          ))}\n        </ul>\n      </div>\n    </div>\n  );\n}`
    },
    {
      filename: "backend/main.py",
      language: "python",
      content: `from fastapi import FastAPI, HTTPException\nfrom fastapi.middleware.cors import CORSMiddleware\nfrom models import StudentModel, db_session\n\napp = FastAPI(title="Student Dashboard API")\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["*"],\n    allow_credentials=True,\n    allow_methods=["*"],\n    allow_headers=["*"],\n)\n\n@app.get("/api/students/{student_id}")\nasync def get_student(student_id: str):\n    # Simulated database fetch\n    mock_db = {\n        "std_98231": {\n            "name": "Alex Mercer",\n            "gpa": 3.84,\n            "courses": [\n                {"id": "CS101", "name": "Intro to Computer Science", "grade": "A"},\n                {"id": "MA201", "name": "Calculus II", "grade": "B+"},\n                {"id": "PH102", "name": "Physics Fundamentals", "grade": "A-"}\n            ]\n        }\n    }\n    \n    student = mock_db.get(student_id)\n    if not student:\n        raise HTTPException(status_code=404, detail="Student not found")\n        \n    return student\n\nif __name__ == "__main__":\n    import uvicorn\n    uvicorn.run(app, host="0.0.0.0", port=8000)`
    },
    {
      filename: "backend/models.py",
      language: "python",
      content: `from pydantic import BaseModel\nfrom typing import List\n\nclass CourseModel(BaseModel):\n    id: str\n    name: str\n    grade: str\n\nclass StudentModel(BaseModel):\n    id: str\n    name: str\n    gpa: float\n    courses: List[CourseModel]\n\n# Simulated DB session connector \nclass SessionLocal:\n    def query(self, model):\n        pass\n\ndb_session = SessionLocal()`
    }
  ];

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const executePipeline = async () => {
    try {
      // PLANNER (2s)
      if (isCancelled) return;
      onMessageCallback?.({ agent: 'planner', status: 'running', message: '› Analyzing prompt and determining feature requirements...' });
      await wait(800);
      onMessageCallback?.({ agent: 'planner', status: 'running', message: '› Breaking down student dashboard structure into 5 features...' });
      await wait(1200);
      onMessageCallback?.({ agent: 'planner', status: 'done', message: '✓ Planner found 5 features, 10 tasks mapped successfully.', output: '{\n  "project_name": "Student Dashboard",\n  "features": ["Auth", "Grade Tracker", "Course List"],\n  "tasks": ["Setup FastAPI", "Build Next.js View"]\n}' });

      // ARCHITECT (3s)
      if (isCancelled) return;
      onMessageCallback?.({ agent: 'architect', status: 'running', message: '› Designing system architecture constraint matrix...' });
      await wait(1000);
      onMessageCallback?.({ agent: 'architect', status: 'running', message: '› Constructing data models and frontend boundaries...' });
      await wait(2000);
      onMessageCallback?.({ agent: 'architect', status: 'done', message: '✓ Architecture resolved: Next.js + FastAPI + SQLite stack established.', output: '{\n  "tech_stack": { "frontend": "Next.js", "backend": "FastAPI" },\n  "file_structure": ["frontend/app/page.tsx", "backend/main.py"]\n}' });

      // DEVELOPER (8s)
      if (isCancelled) return;
      onMessageCallback?.({ agent: 'developer', status: 'running', message: '› Generating frontend Next.js component structures...' });
      await wait(2000);
      onMessageCallback?.({ agent: 'developer', status: 'running', message: '› Fetching Tailwind CSS configurations...' });
      await wait(1500);
      onMessageCallback?.({ agent: 'developer', status: 'running', message: '› Generating backend FastAPI routes and models...' });
      await wait(2500);
      onMessageCallback?.({ agent: 'developer', status: 'running', message: '› Writing application boilerplate and tying connections...' });
      await wait(2000);
      onMessageCallback?.({ agent: 'developer', status: 'done', message: '✓ Coding complete. 4 core files generated.', files: demoFiles });

      // DEBUGGER (3s)
      if (isCancelled) return;
      onMessageCallback?.({ agent: 'debugger', status: 'running', message: '› Scanning generated codebase for vulnerabilities and syntax faults...' });
      await wait(1500);
      onMessageCallback?.({ agent: 'debugger', status: 'running', message: '› Identifying potential hydration mismatch warnings in Dashboard.tsx...' });
      await wait(1500);
      onMessageCallback?.({ agent: 'debugger', status: 'done', message: '✓ Fixed undefined data check sequence in Dashboard.tsx line 47.' });

      // TESTER (2s)
      if (isCancelled) return;
      onMessageCallback?.({ agent: 'tester', status: 'running', message: '› Drafting unit testing suites for FastAPI backend...' });
      await wait(1000);
      onMessageCallback?.({ agent: 'tester', status: 'running', message: '› Establishing Playwright end-to-end integration mock tests...' });
      await wait(1000);
      
      const testFiles = [...demoFiles, { filename: "tests/api.test.py", language: "python", content: "import pytest\nfrom fastapi.testclient import TestClient\nfrom backend.main import app\n\nclient = TestClient(app)\n\ndef test_get_student():\n    response = client.get('/api/students/std_98231')\n    assert response.status_code == 200\n    assert response.json()['name'] == 'Alex Mercer'\n\ndef test_get_student_404():\n    response = client.get('/api/students/invalid')\n    assert response.status_code == 404" }];
      
      onMessageCallback?.({ agent: 'tester', status: 'done', message: '✓ 6 test cases written seamlessly covering 88% of core paths.', files: testFiles });
      
      // FINISH
      if (isCancelled) return;
      onMessageCallback?.({ agent: 'system_complete', status: 'pipeline_complete', message: '', files: testFiles });

    } catch (e) {
      if (onErrorCallback) onErrorCallback(e);
    }
  };

  // Kick off asynchronous mock execution
  executePipeline();

  return {
    subscribe: (callback: (data: PipelineEvent) => void, errCallback?: (err: any) => void) => {
      onMessageCallback = callback;
      if (errCallback) {
        onErrorCallback = errCallback;
      }
    },
    cancel: () => {
      isCancelled = true;
    }
  };
};
