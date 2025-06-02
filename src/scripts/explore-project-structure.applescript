on run argv
    if (count of argv) < 1 then
        error "Project ID required"
    end if
    
    set projectId to item 1 of argv
    
    tell application "Things3"
        -- Find project by ID
        set targetProject to missing value
        repeat with proj in projects
            if id of proj is equal to projectId then
                set targetProject to proj
                exit repeat
            end if
        end repeat
        
        if targetProject is missing value then
            error "Project not found: " & projectId
        end if
        
        set output to ""
        
        -- Get basic project info
        set output to output & "PROJECT: " & name of targetProject & linefeed
        set output to output & "ID: " & id of targetProject & linefeed
        
        -- Try to get all available properties
        try
            set output to output & "Has to dos: " & (count of to dos of targetProject) & linefeed
        end try
        
        -- Check if there are headings
        try
            set projectHeadings to headings of targetProject
            set output to output & "Headings count: " & (count of projectHeadings) & linefeed
            
            -- List each heading
            repeat with heading in projectHeadings
                try
                    set headingTitle to name of heading
                    set headingId to id of heading
                    set output to output & "HEADING: " & headingTitle & " (ID: " & headingId & ")" & linefeed
                    
                    -- Try to get todos under this heading
                    try
                        set headingTodos to to dos of heading
                        set output to output & "  Todos in heading: " & (count of headingTodos) & linefeed
                        
                        repeat with todo in headingTodos
                            set todoTitle to name of todo
                            set todoId to id of todo
                            set output to output & "    TODO: " & todoTitle & " (ID: " & todoId & ")" & linefeed
                        end repeat
                    on error errMsg
                        set output to output & "  Error getting todos: " & errMsg & linefeed
                    end try
                    
                on error errMsg
                    set output to output & "Error processing heading: " & errMsg & linefeed
                end try
            end repeat
            
        on error errMsg
            set output to output & "No headings or error: " & errMsg & linefeed
        end try
        
        -- List all todos in project (might include those under headings)
        set output to output & "ALL TODOS IN PROJECT:" & linefeed
        repeat with todo in to dos of targetProject
            try
                set todoTitle to name of todo
                set todoId to id of todo
                set output to output & "TODO: " & todoTitle & " (ID: " & todoId & ")" & linefeed
                
                -- Try to get heading info for this todo
                try
                    set todoHeading to heading of todo
                    if todoHeading is not missing value then
                        set headingName to name of todoHeading
                        set output to output & "  Under heading: " & headingName & linefeed
                    else
                        set output to output & "  No heading" & linefeed
                    end if
                on error
                    set output to output & "  Heading info unavailable" & linefeed
                end try
                
            on error errMsg
                set output to output & "Error processing todo: " & errMsg & linefeed
            end try
        end repeat
        
        return output
    end tell
end run