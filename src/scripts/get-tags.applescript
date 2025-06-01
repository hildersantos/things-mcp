on run argv
    tell application "Things3"
        set output to ""
        
        repeat with t in tags
            try
                set tagId to id of t
                set tagName to name of t
                
                -- Get parent tag name if exists
                set parentName to ""
                if parent tag of t is not missing value then
                    set parentName to name of parent tag of t
                end if
                
                -- Build output line
                set output to output & tagId & "|" & tagName & "|" & parentName & linefeed
                
            on error errMsg
                log "Error processing tag: " & errMsg
            end try
        end repeat
        
        return output
    end tell
end run