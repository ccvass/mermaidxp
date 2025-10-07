import React, { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { setMermaidCode } from '../../store/slices/diagramSlice';
import { showNotification } from '../../store/slices/uiSlice';

interface DiagramSample {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  icon: string;
}

const diagramSamples: DiagramSample[] = [
  // DEMO/WELCOME DIAGRAM
  {
    id: 'welcome-demo',
    name: 'Welcome Demo',
    description: 'Complete showcase of Mermaid features',
    category: 'Demo',
    icon: '🎨',
    code: `graph TD
    A[Start] --> B{Is it?};
    B -- Yes --> C[OK];
    C --> D[End];
    B -- No --> E[Find Solution];
    E --> F[<img src='https://picsum.photos/80/50?random=1' alt='solution image'/><br/>Solution Found?];
    F -- Yes --> C;
    F -- No --> G[Give Up!];
    G --> D;

    subgraph center [" "]
        N1(Rounded Node)
        N2[Rectangular Node]
        N3[/Parallelogram Node/]
        N4((Circular Node))
        N5{Diamond Node}
        N6{{Hexagon Node}}
    end

    style A fill:#9f9,stroke:#333,stroke-width:2px,color:#000
    style D fill:#f99,stroke:#333,stroke-width:2px,color:#000
    style F text-align:center
    style center fill:#f9f9f9,stroke:#333,stroke-width:1px`,
  },
  // FLOWCHART DIAGRAMS
  {
    id: 'flowchart-basic',
    name: 'Flowchart Basic',
    description: 'Simple decision flow with start and end',
    category: 'Flowchart',
    icon: '📊',
    code: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`,
  },
  {
    id: 'flowchart-advanced',
    name: 'Flowchart Advanced',
    description: 'Load balancer architecture with styles',
    category: 'Flowchart',
    icon: '🎨',
    code: `flowchart LR
    A[Client] --> B[Load Balancer]
    B --> C[Server 1]
    B --> D[Server 2]
    B --> E[Server 3]
    C --> F[(Database)]
    D --> F
    E --> F
    
    style A fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style B fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style C fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    style D fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    style E fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    style F fill:#fff3e0,stroke:#e65100,stroke-width:3px`,
  },
  {
    id: 'flowchart-shapes',
    name: 'Flowchart Shapes',
    description: 'All available Mermaid shapes',
    category: 'Flowchart',
    icon: '🔷',
    code: `flowchart TD
    A[Rectangle] --> B(Round)
    B --> C{Diamond}
    C --> D((Circle))
    D --> E>Flag]
    E --> F[/Parallelogram/]
    F --> G[\\Trapezoid\\]
    G --> H[/Trapezoid Alt\\]
    H --> I[\\Trapezoid Alt/]
    I --> J{{Hexagon}}
    J --> K[["Subroutine"]]`,
  },
  {
    id: 'flowchart-emojis',
    name: 'Flowchart with Emojis',
    description: 'Development workflow with visual icons',
    category: 'Flowchart',
    icon: '🚀',
    code: `flowchart TD
    A["🚀 Start Project"] --> B["👥 Team Meeting"]
    B --> C{"📋 Requirements Clear?"}
    C -->|✅ Yes| D["💻 Development"]
    C -->|❌ No| E["📝 Clarify Requirements"]
    E --> B
    D --> F["🧪 Testing"]
    F --> G{"🐛 Bugs Found?"}
    G -->|✅ Yes| H["🔧 Fix Bugs"]
    H --> F
    G -->|❌ No| I["🚀 Deploy"]
    I --> J["🎉 Success!"]
    
    style A fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    style J fill:#e3f2fd,stroke:#1976d2,stroke-width:3px`,
  },

  // SEQUENCE DIAGRAMS
  {
    id: 'sequence-basic',
    name: 'Sequence Basic',
    description: 'Simple user authentication flow',
    category: 'Sequence',
    icon: '🔄',
    code: `sequenceDiagram
    participant U as User
    participant A as App
    participant D as Database
    
    U->>A: Login Request
    A->>D: Validate User
    D-->>A: User Valid
    A-->>U: Login Success`,
  },
  {
    id: 'sequence-advanced',
    name: 'Sequence Advanced',
    description: 'Complex flow with loops and alternatives',
    category: 'Sequence',
    icon: '⚡',
    code: `sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Database
    participant Q as Queue
    
    Note over C,DB: Authentication Flow
    C->>+S: Login(username, password)
    S->>+DB: SELECT user WHERE username=?
    DB-->>-S: User data
    
    alt User exists
        S->>S: Validate password
        S->>+Q: Log login event
        Q-->>-S: Event logged
        S-->>C: 200 OK + JWT Token
    else User not found
        S-->>C: 401 Unauthorized
    end
    
    Note right of C: User authenticated
    
    loop Every 5 minutes
        C->>S: Heartbeat
        S-->>C: Pong
    end`,
  },

  // CLASS DIAGRAMS
  {
    id: 'class-basic',
    name: 'Class Basic',
    description: 'Simple inheritance example',
    category: 'Class',
    icon: '🏗️',
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    
    class Dog {
        +String breed
        +bark()
    }
    
    class Cat {
        +String color
        +meow()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat`,
  },
  {
    id: 'class-advanced',
    name: 'Class System',
    description: 'Simple class hierarchy system',
    category: 'Class',
    icon: '🏪',
    code: `classDiagram
    Animal <|-- Dog
    Animal <|-- Cat
    Animal <|-- Bird
    
    Animal : +String name
    Animal : +int age
    Animal : +makeSound()
    Animal : +move()
    
    Dog : +String breed
    Dog : +bark()
    Dog : +wagTail()
    
    Cat : +String color
    Cat : +meow()
    Cat : +purr()
    
    Bird : +String species
    Bird : +fly()
    Bird : +chirp()`,
  },

  // STATE DIAGRAMS
  {
    id: 'state-basic',
    name: 'State Basic',
    description: 'Simple state machine',
    category: 'State',
    icon: '🔀',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Running : start
    Running --> Idle : stop
    Running --> Error : failure
    Error --> Idle : reset
    Error --> [*] : terminate`,
  },
  {
    id: 'state-advanced',
    name: 'State Advanced',
    description: 'Complex system with nested states',
    category: 'State',
    icon: '⚙️',
    code: `stateDiagram-v2
    [*] --> PowerOff
    
    state PowerOff {
        [*] --> Standby
        Standby --> BootingUp : power_button
    }
    
    BootingUp --> Running : boot_complete
    
    state Running {
        [*] --> Normal
        Normal --> HighLoad : cpu_spike
        HighLoad --> Normal : load_normal
        Normal --> Maintenance : maintenance_mode
        Maintenance --> Normal : maintenance_complete
        
        state Normal {
            [*] --> Processing
            Processing --> Waiting : task_complete
            Waiting --> Processing : new_task
        }
    }
    
    Running --> Shutting : shutdown_signal
    Shutting --> PowerOff : shutdown_complete
    Running --> Error : system_error
    Error --> Running : error_resolved
    Error --> PowerOff : critical_error`,
  },

  // ER DIAGRAMS
  {
    id: 'er-basic',
    name: 'ER Basic',
    description: 'Simple database relationships',
    category: 'ER',
    icon: '🗄️',
    code: `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "ordered in"
    
    USER {
        int id PK
        string email
        string name
    }
    
    ORDER {
        int id PK
        int user_id FK
        date order_date
    }`,
  },
  {
    id: 'er-advanced',
    name: 'ER Advanced',
    description: 'Complete e-commerce database schema',
    category: 'ER',
    icon: '🏬',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : "places"
    CUSTOMER {
        int customer_id PK
        string first_name
        string last_name
        string email UK
        string phone
        date created_at
    }
    
    ORDER ||--|{ ORDER_ITEM : "contains"
    ORDER {
        int order_id PK
        int customer_id FK
        date order_date
        decimal total_amount
        string status
        string shipping_address
    }
    
    PRODUCT ||--o{ ORDER_ITEM : "included in"
    PRODUCT {
        int product_id PK
        string name
        string description
        decimal price
        int stock_quantity
        int category_id FK
    }
    
    ORDER_ITEM {
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    
    CATEGORY ||--o{ PRODUCT : "categorizes"
    CATEGORY {
        int category_id PK
        string name
        string description
    }`,
  },

  // GANTT CHARTS
  {
    id: 'gantt-basic',
    name: 'Gantt Basic',
    description: 'Simple project timeline',
    category: 'Gantt',
    icon: '📅',
    code: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    
    section Planning
    Requirements    :done, req, 2024-01-01, 2024-01-05
    Design         :done, des, 2024-01-06, 2024-01-12
    
    section Development
    Backend        :active, dev1, 2024-01-13, 2024-02-15
    Frontend       :dev2, 2024-01-20, 2024-02-20
    
    section Testing
    Unit Tests     :test1, after dev1, 5d
    Integration    :test2, after dev2, 3d`,
  },
  {
    id: 'gantt-advanced',
    name: 'Gantt Advanced',
    description: 'Complete SDLC with milestones',
    category: 'Gantt',
    icon: '🎯',
    code: `gantt
    title Software Development Lifecycle
    dateFormat YYYY-MM-DD
    axisFormat %m/%d
    
    section Analysis
    Market Research        :done, research, 2024-01-01, 2024-01-07
    Requirements Gathering :done, req, 2024-01-08, 2024-01-15
    Technical Analysis     :done, tech, 2024-01-16, 2024-01-22
    
    section Design
    UI/UX Design          :done, design, 2024-01-23, 2024-02-05
    System Architecture   :done, arch, 2024-01-30, 2024-02-10
    Database Design       :done, db, 2024-02-06, 2024-02-12
    
    section Development
    Authentication Module :active, auth, 2024-02-13, 2024-02-25
    User Management      :dev1, 2024-02-20, 2024-03-05
    Core Features        :dev2, 2024-02-26, 2024-03-15
    API Development      :api, 2024-03-01, 2024-03-20
    
    section Testing
    Unit Testing         :test1, after auth, 5d
    Integration Testing  :test2, after dev1, 7d
    System Testing       :test3, after api, 10d
    User Acceptance      :uat, after test3, 5d
    
    section Deployment
    Production Setup     :deploy1, after uat, 3d
    Go Live             :milestone, golive, after deploy1, 0d`,
  },

  // PIE CHARTS
  {
    id: 'pie-basic',
    name: 'Pie Basic',
    description: 'Simple data distribution',
    category: 'Pie',
    icon: '🥧',
    code: `pie title Browser Usage
    "Chrome" : 65
    "Firefox" : 15
    "Safari" : 12
    "Edge" : 8`,
  },
  {
    id: 'pie-advanced',
    name: 'Pie Advanced',
    description: 'Technology stack distribution',
    category: 'Pie',
    icon: '💻',
    code: `pie title Technology Stack Distribution
    "Frontend (React/Vue)" : 35
    "Backend (Node.js/Python)" : 25
    "Database (SQL/NoSQL)" : 20
    "DevOps (Docker/K8s)" : 12
    "Mobile (React Native)" : 8`,
  },

  // GIT GRAPH
  {
    id: 'git-workflow',
    name: 'Git Workflow',
    description: 'Version control workflow as flowchart',
    category: 'Git',
    icon: '🌳',
    code: `flowchart TD
    A[Main Branch] --> B[Create Feature Branch]
    B --> C[Develop Feature]
    C --> D[Commit Changes]
    D --> E{Feature Complete?}
    E -->|No| C
    E -->|Yes| F[Create Pull Request]
    F --> G[Code Review]
    G --> H{Approved?}
    H -->|No| I[Fix Issues]
    I --> G
    H -->|Yes| J[Merge to Main]
    J --> K[Deploy]
    
    style A fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style J fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style K fill:#fff3e0,stroke:#f57c00,stroke-width:2px`,
  },

  // JOURNEY DIAGRAM
  {
    id: 'user-journey',
    name: 'User Journey',
    description: 'Customer experience mapping',
    category: 'Journey',
    icon: '🗺️',
    code: `journey
    title User Shopping Experience
    section Discovery
      Visit Website: 5: User
      Browse Products: 4: User
      Read Reviews: 3: User
    section Purchase
      Add to Cart: 5: User
      Checkout: 3: User
      Payment: 2: User, System
    section Fulfillment
      Order Processing: 3: System
      Shipping: 4: System
      Delivery: 5: User, Courier`,
  },

  // MATRIX CHART
  {
    id: 'matrix-chart',
    name: 'Priority Matrix',
    description: 'Task prioritization matrix',
    category: 'Matrix',
    icon: '📊',
    code: `flowchart TD
    subgraph "High Impact"
        A[Quick Wins<br/>High Impact, Low Effort]
        B[Major Projects<br/>High Impact, High Effort]
    end
    
    subgraph "Low Impact"
        C[Fill-ins<br/>Low Impact, Low Effort]
        D[Thankless Tasks<br/>Low Impact, High Effort]
    end
    
    A --> E[React Implementation]
    A --> F[Vue Migration]
    B --> G[Angular Rewrite]
    B --> H[System Architecture]
    C --> I[jQuery Updates]
    C --> J[CSS Fixes]
    D --> K[Legacy Support]
    D --> L[Old Browser Support]
    
    style A fill:#c8e6c9,stroke:#4caf50,stroke-width:2px
    style B fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    style C fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px
    style D fill:#ffebee,stroke:#f44336,stroke-width:2px`,
  },

  // KNOWLEDGE MAP
  {
    id: 'knowledge-map',
    name: 'Knowledge Map',
    description: 'Web development skills hierarchy',
    category: 'Knowledge',
    icon: '🧠',
    code: `flowchart TD
    WD[Web Development] --> FE[Frontend]
    WD --> BE[Backend]
    WD --> DO[DevOps]
    
    FE --> HTML[HTML]
    FE --> CSS[CSS]
    FE --> JS[JavaScript]
    
    HTML --> SE[Semantic Elements]
    HTML --> ACC[Accessibility]
    
    CSS --> FLEX[Flexbox]
    CSS --> GRID[Grid]
    CSS --> ANIM[Animations]
    
    JS --> ES6[ES6+]
    JS --> FRAME[Frameworks]
    
    FRAME --> REACT[React]
    FRAME --> VUE[Vue]
    FRAME --> ANG[Angular]
    
    BE --> LANG[Languages]
    BE --> DB[Databases]
    
    LANG --> NODE[Node.js]
    LANG --> PY[Python]
    LANG --> JAVA[Java]
    
    DB --> SQL[SQL]
    DB --> NOSQL[NoSQL]
    
    SQL --> MYSQL[MySQL]
    SQL --> POSTGRES[PostgreSQL]
    
    NOSQL --> MONGO[MongoDB]
    NOSQL --> REDIS[Redis]
    
    DO --> CONT[Containers]
    DO --> CICD[CI/CD]
    
    CONT --> DOCKER[Docker]
    CONT --> K8S[Kubernetes]
    
    CICD --> GHA[GitHub Actions]
    CICD --> JENKINS[Jenkins]
    
    style WD fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    style FE fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style BE fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style DO fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px`,
  },

  // HISTORY TIMELINE
  {
    id: 'history-timeline',
    name: 'History Timeline',
    description: 'Web development evolution',
    category: 'Timeline',
    icon: '⏰',
    code: `gantt
    title History of Web Development
    dateFormat YYYY
    axisFormat %Y
    
    section Early Web
    HTML Created        :milestone, html, 1990, 0d
    First Browser       :milestone, browser, 1990, 0d
    
    section Dynamic Web
    JavaScript Born     :milestone, js, 1995, 0d
    CSS Introduced      :milestone, css, 1995, 0d
    AJAX Revolution     :milestone, ajax, 2000, 0d
    
    section Modern Era
    HTML5 Standard      :milestone, html5, 2010, 0d
    Mobile Web Growth   :milestone, mobile, 2010, 0d
    React Released      :milestone, react, 2015, 0d
    ES6 Standard        :milestone, es6, 2015, 0d
    
    section Current
    JAMstack Popular    :milestone, jam, 2020, 0d
    Serverless Computing :milestone, serverless, 2020, 0d`,
  },

  // NETWORK ARCHITECTURE
  {
    id: 'network-architecture',
    name: 'Network Architecture',
    description: 'Complex system architecture',
    category: 'Architecture',
    icon: '🏗️',
    code: `flowchart TB
    subgraph "🌐 Internet"
        CDN[CDN]
        DNS[DNS Server]
    end
    
    subgraph "🔒 DMZ"
        LB[Load Balancer]
        WAF[Web Application Firewall]
    end
    
    subgraph "🏢 Application Tier"
        WS1[Web Server 1]
        WS2[Web Server 2]
        WS3[Web Server 3]
    end
    
    subgraph "⚙️ Service Tier"
        API1[API Gateway]
        MS1[Microservice 1]
        MS2[Microservice 2]
        MS3[Microservice 3]
    end
    
    subgraph "💾 Data Tier"
        DB1[(Primary DB)]
        DB2[(Replica DB)]
        CACHE[(Redis Cache)]
    end
    
    CDN --> LB
    DNS --> LB
    LB --> WAF
    WAF --> WS1
    WAF --> WS2
    WAF --> WS3
    WS1 --> API1
    WS2 --> API1
    WS3 --> API1
    API1 --> MS1
    API1 --> MS2
    API1 --> MS3
    MS1 --> DB1
    MS2 --> DB1
    MS3 --> DB1
    DB1 --> DB2
    MS1 --> CACHE
    MS2 --> CACHE
    MS3 --> CACHE
    
    style CDN fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style LB fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style DB1 fill:#fff3e0,stroke:#ef6c00,stroke-width:3px`,
  },
];

const categories = [...new Set(diagramSamples.map((sample) => sample.category))];

export const DiagramSamples: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredSamples =
    selectedCategory === 'All'
      ? diagramSamples
      : diagramSamples.filter((sample) => sample.category === selectedCategory);

  const handleSampleSelect = (sample: DiagramSample) => {
    // Load the diagram code first
    dispatch(setMermaidCode(sample.code));

    // Note: Auto-centering is now handled automatically by DiagramDisplay.tsx
    // No need to manually center here

    // Show notification
    dispatch(
      showNotification({
        message: `Loaded ${sample.name} example`,
        type: 'success',
      })
    );
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">📚</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Diagram Examples ({diagramSamples.length})
          </span>
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900">
          {/* Category Filter */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All ({diagramSamples.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category} ({diagramSamples.filter((s) => s.category === category).length})
                </button>
              ))}
            </div>
          </div>

          {/* Samples Grid */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredSamples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSampleSelect(sample)}
                className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{sample.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{sample.name}</h4>
                      <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {sample.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{sample.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Click any example to load it into the editor. You can then modify the code to customize it.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
