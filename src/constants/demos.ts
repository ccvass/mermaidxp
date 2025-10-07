export interface Demo {
  label: string;
  code: string;
}

export const DEMOS: Demo[] = [
  // 1. FLOWCHART - Basic
  {
    label: 'Flowchart Basic',
    code: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`,
  },

  // 2. FLOWCHART - Advanced with Styles
  {
    label: 'Flowchart Advanced',
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

  // 3. SEQUENCE DIAGRAM - Basic
  {
    label: 'Sequence Basic',
    code: `sequenceDiagram
    participant U as User
    participant A as App
    participant D as Database
    
    U->>A: Login Request
    A->>D: Validate User
    D-->>A: User Valid
    A-->>U: Login Success`,
  },

  // 4. SEQUENCE DIAGRAM - Advanced
  {
    label: 'Sequence Advanced',
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

  // 5. CLASS DIAGRAM - Basic
  {
    label: 'Class Basic',
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

  // 6. CLASS DIAGRAM - Advanced
  {
    label: 'Class Advanced',
    code: `classDiagram
    class User {
        <<interface>>
        +String email
        +String password
        +Date createdAt
        +login()
        +logout()
    }
    
    class Admin {
        <<service>>
        +String[] permissions
        +manageUsers()
        +viewReports()
    }
    
    class Customer {
        <<entity>>
        +String address
        +String phone
        +placeOrder()
        +viewHistory()
    }
    
    class Order {
        <<aggregate>>
        -String id
        -Date orderDate
        -OrderStatus status
        +calculateTotal()
        +updateStatus()
    }
    
    class Product {
        +String name
        +Float price
        +int stock
        +updateStock()
    }
    
    User <|-- Admin
    User <|-- Customer
    Customer ||--o{ Order
    Order }o--|| Product
    
    class OrderStatus {
        <<enumeration>>
        PENDING
        PROCESSING
        SHIPPED
        DELIVERED
        CANCELLED
    }`,
  },

  // 7. STATE DIAGRAM - Basic
  {
    label: 'State Basic',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Running : start
    Running --> Idle : stop
    Running --> Error : failure
    Error --> Idle : reset
    Error --> [*] : terminate`,
  },

  // 8. STATE DIAGRAM - Advanced
  {
    label: 'State Advanced',
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

  // 9. ER DIAGRAM - Basic
  {
    label: 'ER Basic',
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

  // 10. ER DIAGRAM - Advanced
  {
    label: 'ER Advanced',
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
    }
    
    SUPPLIER ||--o{ PRODUCT : "supplies"
    SUPPLIER {
        int supplier_id PK
        string company_name
        string contact_person
        string email
        string phone
    }`,
  },

  // 11. GANTT CHART - Basic
  {
    label: 'Gantt Basic',
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

  // 12. GANTT CHART - Advanced
  {
    label: 'Gantt Advanced',
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

  // 13. PIE CHART - Basic
  {
    label: 'Pie Basic',
    code: `pie title Browser Usage
    "Chrome" : 65
    "Firefox" : 15
    "Safari" : 12
    "Edge" : 8`,
  },

  // 14. PIE CHART - Advanced
  {
    label: 'Pie Advanced',
    code: `pie title Technology Stack Distribution
    "Frontend (React/Vue)" : 35
    "Backend (Node.js/Python)" : 25
    "Database (SQL/NoSQL)" : 20
    "DevOps (Docker/K8s)" : 12
    "Mobile (React Native)" : 8`,
  },

  // 15. GIT GRAPH - Working Version
  {
    label: 'Git Graph',
    code: `gitGraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Feature 1"
    commit id: "Feature 2"
    checkout main
    commit id: "Hotfix"
    merge develop
    commit id: "Release v1.0"`,
  },

  // 16. JOURNEY DIAGRAM
  {
    label: 'User Journey',
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

  // 17. QUADRANT CHART
  {
    label: 'Quadrant Chart',
    code: `quadrantChart
    title Technology Adoption Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    
    quadrant-1 Quick Wins
    quadrant-2 Major Projects
    quadrant-3 Fill-ins
    quadrant-4 Thankless Tasks
    
    React: [0.8, 0.9]
    Vue: [0.6, 0.7]
    Angular: [0.4, 0.8]
    jQuery: [0.2, 0.3]
    Svelte: [0.7, 0.6]`,
  },

  // 18. REQUIREMENT DIAGRAM
  {
    label: 'Requirement Diagram',
    code: `requirementDiagram
    requirement UserAuth {
        id: 1
        text: User must be able to authenticate
        risk: Medium
        verifymethod: Test
    }
    
    requirement DataSecurity {
        id: 2
        text: Data must be encrypted
        risk: High
        verifymethod: Inspection
    }
    
    element WebApp {
        type: System
    }
    
    element Database {
        type: Component
    }
    
    UserAuth - satisfies -> WebApp
    DataSecurity - satisfies -> Database
    WebApp - contains -> Database`,
  },

  // 19. MINDMAP
  {
    label: 'Mindmap',
    code: `mindmap
  root((Web Development))
    Frontend
      HTML
        Semantic Elements
        Accessibility
      CSS
        Flexbox
        Grid
        Animations
      JavaScript
        ES6+
        Frameworks
          React
          Vue
          Angular
    Backend
      Languages
        Node.js
        Python
        Java
      Databases
        SQL
          MySQL
          PostgreSQL
        NoSQL
          MongoDB
          Redis
    DevOps
      Containers
        Docker
        Kubernetes
      CI/CD
        GitHub Actions
        Jenkins`,
  },

  // 20. TIMELINE
  {
    label: 'Timeline',
    code: `timeline
    title History of Web Development
    
    1990 : HTML Created
         : First Web Browser
    
    1995 : JavaScript Born
         : CSS Introduced
    
    2000 : AJAX Revolution
         : Dynamic Web Apps
    
    2010 : HTML5 Standard
         : Mobile Web Growth
    
    2015 : Modern Frameworks
         : React Released
         : ES6 Standard
    
    2020 : JAMstack Popular
         : Serverless Computing
         : WebAssembly Growth`,
  },

  // 21. SANKEY DIAGRAM
  {
    label: 'Sankey Diagram',
    code: `sankey-beta
    Traffic Sources,Website,1000
    Website,Homepage,800
    Website,Product Page,200
    Homepage,Sign Up,300
    Homepage,Browse,500
    Product Page,Purchase,150
    Product Page,Cart,50
    Sign Up,Active User,250
    Browse,Product Page,200
    Purchase,Customer,150`,
  },

  // 22. FLOWCHART WITH IMAGES
  {
    label: 'Flowchart with Images',
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
    style J fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style C fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px`,
  },

  // 23. COMPLEX NETWORK DIAGRAM
  {
    label: 'Network Architecture',
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
